const core = require('@actions/core')

/**
 * 获取 GITHUB_WORKSPACE 变量前先使用  @actions/checkout，否则为空
 * 请 https://help.github.com/en/actions/configuring-and-managing-workflows/using-environment-variables#default-environment-variables 
 */
function getWorkspace() {
    let githubWorkspacePath = process.env['GITHUB_WORKSPACE']
    if (!githubWorkspacePath) {
        throw new Error('GITHUB_WORKSPACE not defined, please use @actions/checkout before use me')
    }
    return githubWorkspacePath
}

function getInput() {
    return {
        accessKey: core.getInput('accessKey'),
        secretKey: core.getInput('secretKey'),
        bucket: core.getInput('bucket'),
        zone: core.getInput('zone'),
        folderPath: core.getInput('folderPath'),
        fsizeLimit: core.getInput('fsizeLimit'),
        mimeLimit: core.getInput('mimeLimit'),
        token: core.getInput('token'), 
    }
}

const [owner, repo] = process.env['GITHUB_REPOSITORY'].split('/')

module.exports = {
    getWorkspace,
    getInput,
    owner, 
    repo,
    workflowName: process.env['GITHUB_WORKFLOW'],
    branch: process.env['GITHUB_REF']
}