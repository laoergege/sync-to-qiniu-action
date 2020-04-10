
const { getInput } = require('./input-helper')
const childProcess = require('child_process');
const util = require('util');
const core = require('@actions/core')
const { getWorkspace } = require('./input-helper')

const { githubWorkspacePath } = getWorkspace()

const exec = (function () {
    const _exec = util.promisify(childProcess.exec)
    return function (command) {
        return _exec(command,  {
            cwd: githubWorkspacePath
        })
    }
})()

async function diff() {
    const { folderPath } = getInput()
    const globPath = `${folderPath}/**`

    // 测试 log

    // 禁止 git 中文文件名编码
    await exec('git config --global core.quotepath false')

    await exec(`git add '${globPath}'`).catch(() => {
        core.info(`There are not change in ${folderPath}`)
    })

    const { stdout: std1 } = await exec(`git status -s -- ${globPath}`)

    // 判断目标目录里是否改动
    let command = `git diff --raw ${std1.length ? 'HEAD' : 'HEAD~1'} -- '${globPath}'`

    try {
        const { stdout } = await exec(command)

        const lines = stdout.match(/.+$/gm) || []

        const summary = lines.map((line) => (line.split(/\s/).slice(4))).map((row) => {
            row[0] = row[0].replace(/\d/g, '')
            return row
        })

        return summary
    } catch (err) {
        const { stderr } = err
        if (stderr.includes("fatal: bad revision")) {
            core.error('please set fetch-depth of the "actions/checkout" config, eg. fetch-depth: 2')
        }
        throw(stderr)
    }
}

module.exports = diff