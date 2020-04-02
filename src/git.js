
const { getWorkspace } = require('./input-helper')

const simpleGit = require('simple-git')(getWorkspace());

module.exports = simpleGit