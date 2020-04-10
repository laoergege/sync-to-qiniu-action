const { getInput } = require('./input-helper')
const github = require('@actions/github');

const { token } = getInput()

const client = new github.GitHub(token);

function listRepoWorkflows() {
    return client.actions.listRepoWorkflows({
        owner: 'laoergege',
        repo: 'sync-to-qiniu-action'
    })
}

module.exports = {
    listRepoWorkflows
}