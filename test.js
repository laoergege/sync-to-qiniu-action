const fs = require('fs')

process.env['GITHUB_WORKSPACE']  = __dirname

const simpleGit = require('./src/git')

process.env['GITHUB_WORKSPACE']  = __dirname


simpleGit.diff((res) => {
    console.log(res)
})

let res = fs.statSync('images/123.png')
console.log(res)