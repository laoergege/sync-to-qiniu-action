const path = require('path')
const git = require('isomorphic-git')
const http = require('isomorphic-git/http/node')
const fs = require('fs')
const { getWorkspace } = require('./input-helper')

/**
 * 封装了 fs 和 dir
 * @param {string} command 参考 https://github.com/isomorphic-git/isomorphic-git#commands
 * @param  {...any} res 
 */
function gitCommand(command, params) {
    if (!git[command]) {
        return Promise.reject(`There is not the ${command} command!`)
    }

    return git[command]({ fs, dir: getWorkspace(), ...params })
}

module.exports = {
    gitCommand
}