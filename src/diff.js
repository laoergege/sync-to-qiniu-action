
const { getInput } = require('./input-helper')
const childProcess = require('child_process');
const util = require('util');
const core = require('@actions/core')
const { getWorkspace } = require('./input-helper')
const { listWorkflowRuns } = require('./github')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

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
    const { path } = getInput()
    const globPath = `${path}/**`

    // 禁止 git 中文文件名编码
    await exec('git config --global core.quotepath false')

    let command

    await exec(`git add -- '${globPath}'`).catch(() => {
        core.info(`There are not change in ${path}`)
    })

    const { workflow_runs } = await listWorkflowRuns()
    // run1 正在运行，run2 上次运行
    const [run1, run2] = workflow_runs;

    // 获取确保 run2 之后的所有 commit
    let sinceDate = dayjs.utc(run2.head_commit.timestamp).subtract(1, 'day').format('YYYY-MM-DD')
    let branch = run1.head_branch
    await exec(`git fetch --shallow-since=${sinceDate} origin ${branch}`)

    command = `git diff --raw ${run2.head_sha} ${run1.head_sha} -- '${globPath}'`

    const { stdout } = await exec(command)

    const lines = stdout.match(/.+$/gm) || []

    const summary = lines.map((line) => (line.split(/\s/).slice(4))).map((row) => {
        row[0] = row[0].replace(/\d/g, '')
        return row
    })

    return summary
}

module.exports = diff