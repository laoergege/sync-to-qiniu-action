
const { getInput } = require('./input-helper')
const childProcess = require('child_process');
const util = require('util');

const exec = util.promisify(childProcess.exec);

async function diff() {
    const { folderPath } = getInput()
    const globPath = `${folderPath}/**`

    await exec(`git add ${globPath}`)
    const { stdout } = await exec(`git diff --raw HEAD  -- ${globPath}`)

    const lines = stdout.match(/.*\n/mg)

    const summary = lines.map((line) => (line.split(/\s/).slice(4)))

    console.log(summary)
}

module.exports = diff