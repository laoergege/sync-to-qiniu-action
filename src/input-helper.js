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
        folderPath: core.getInput('folderPath'),
        fsizeLimit: core.getInput('fsizeLimit'),
        mimeLimit: core.getInput('folderPath')
    }
}

module.exports = {
    getWorkspace,
    getInput
}