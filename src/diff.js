
const { getInput } = require('./input-helper')
const childProcess = require('child_process');
const util = require('util');
const core = require('@actions/core')
const { getWorkspace } = require('./input-helper')
const { listWorkflowRuns } = require('./github')
const dayjs = require('dayjs')

const { githubWorkspacePath } = getWorkspace()

const exec = (function () {
    const _exec = util.promisify(childProcess.exec)
    return function (command) {
        return _exec(command, {
            cwd: githubWorkspacePath
        })
    }
})()

async function diff() {
    const { folderPath, branch } = getInput()
    const globPath = `${folderPath}/**`

    console.log(branch)

    // 禁止 git 中文文件名编码
    await exec('git config --global core.quotepath false')

    const { stdout: std1 } = await exec(`git status -s -- ${globPath}`)

    let command
    if (std1.length) {
        await exec(`git add '${globPath}'`).catch(() => {
            core.info(`There are not change in ${folderPath}`)
        })

        command = `git diff --raw 'HEAD' -- '${globPath}'`
    } else {
        const { workflow_runs } = await listWorkflowRuns()
        const [run1, run2] = workflow_runs;

        let sinceDate = dayjs(run2['created_at']).subtract(1, 'date').toISOString()
        console.log(await exec(`git fetch --shallow-since=${sinceDate} origin master`))
        console.log(await exec(`git log -n 3`))

        command = `git diff --raw ${run2.head_sha} ${run1.head_sha} -- '${globPath}'`
    }


    const { stdout } = await exec(command)

    const lines = stdout.match(/.+$/gm) || []

    const summary = lines.map((line) => (line.split(/\s/).slice(4))).map((row) => {
        row[0] = row[0].replace(/\d/g, '')
        return row
    })

    return summary
}

module.exports = diff