const { getInput, workflowID, owner, repo  } = require('./input-helper')
const github = require('@actions/github');

const { token } = getInput()

const client = new github.GitHub(token);

function listRepoWorkflows() {
    return client.actions.listWorkflowRuns({
        owner,
        repo,
        workflow_id: 'test',
        per_page: 5,
        page: 1
    })
}

module.exports = {
    listRepoWorkflows
}