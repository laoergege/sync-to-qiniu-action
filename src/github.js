const { owner, repo, workflowName, token  } = require('./input-helper')
const github = require('@actions/github');


const client = new github.GitHub(token);

// 获取所有 workflow
function listRepoWorkflows() {
    return client.actions.listRepoWorkflows({
        owner,
        repo
    })
}

/**
 * 获取 action 执行所在的 workflow 的 runs
 * @param {*} option Octokit.ActionsListWorkflowRunsParams
 */
async function listWorkflowRuns(option = { per_page: 5, page: 1 }) {
    const { data } = await listRepoWorkflows();
    const { workflows } = data; 
    
    const { id } = workflows.find(({ name }) => (name === workflowName))

    return client.actions.listWorkflowRuns({
        owner,
        repo,
        workflow_id: id,
        ...option
    }).then(({data}) => (data))
}

module.exports = {
    listWorkflowRuns
}