const { getInput } = require('./input-helper')
const github = require('@actions/github');

const { token } = getInput()

const client = new github.GitHub(token);

function listRepoWorkflows() {
    return client.actions.listWorkflowRuns({
        owner: 'laoergege',
        repo: 'sync-to-qiniu-action',
        workflow_file_id: '905030'
    })
}

module.exports = {
    listRepoWorkflows
}