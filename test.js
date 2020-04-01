const { gitCommand } = require('./src/git')

process.env['GITHUB_WORKSPACE']  = __dirname

function test(callback, ...params) {
    callback(params[0], params[1]).then((res) => {
        console.log(res)
    })
}

test(gitCommand, 'status', { filepath: 'package.json' })