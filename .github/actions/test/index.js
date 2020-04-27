const core = require('@actions/core');
const exec = require('@actions/exec');
const action = require('../../../src/action')
const io = require('@actions/io');

async function commit(msg) {
    await exec.exec("git add -- 'demo/**'");
    await exec.exec(`git commit -m '${msg}'`);
    await exec.exec('git push');
}

async function main() {
    await exec.exec('git config --global user.email "test@qq.com"');
    await exec.exec('git config --global user.name "laoergege"');

    await io.mkdirP('demo');   

    // add
    await exec.exec('echo 123 > demo/test.txt');
    await commit('add test.txt')
    await action()
    
    // change
    await exec.exec('echo 123 >> demo/test.txt');
    await commit('change test.txt')
    await action()

    // rename
    await exec.exec('git mv demo/test.txt demo/Test.txt');
    await commit('rename test.txt Test.txt')
    await action()

    // delete
    await exec.exec('git rm demo/Test.txt');
    await commit('delete Test.txt')
    await action()
}

(async () => {
    try {
        run()
    } catch (error) {
        core.setFailed(1)
    }
})()