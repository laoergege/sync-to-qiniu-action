
const { getInput } = require('./input-helper')
const childProcess = require('child_process');
const util = require('util');

const exec = util.promisify(childProcess.exec);

async function diff() {
    const { folderPath } = getInput()
    const globPath = `${folderPath}/**`
    
    // 禁止 git 中文文件名编码
    await exec('git config --global core.quotepath false')
    
    await exec(`git add ${globPath}`)

    const { stdout: std1 } = await exec(`git status -s -- ${globPath}`)

    // 判断目标目录里是否改动
    let command = `git diff --raw ${ std1.length ? 'HEAD' : 'HEAD^1' }  -- ${globPath}`

    const { stdout } = await exec(command)

    const lines = stdout.match(/.*\n/mg) || []

    const summary = lines.map((line) => (line.split(/\s/).slice(4))).map((row) => {
        row[0] = row[0].replace(/\d/g, '')
        return row
    })

    return summary
}

module.exports = diff