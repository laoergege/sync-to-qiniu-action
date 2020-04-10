const { getInput, owner, repo  } = require('./input-helper')
const github = require('@actions/github');

const { token } = getInput()

const client = new github.GitHub(token);

function listRepoWorkflows() {
    return client.actions.listRepoWorkflowRuns({
        owner,
        repo,
        per_page: 5,
        page: 1
    })
}

module.exports = {
    listRepoWorkflows
}