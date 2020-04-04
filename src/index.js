const path = require('path')
const core = require('@actions/core');
const diff = require('./src/diff')
const Quniu = require('./src/qiniu')
const { getInput, getWorkspace } = require('./input-helper')

async function run() {
  const githubWorkspacePath = getWorkspace()
  if (process.cwd() !== githubWorkspacePath) {
    core.setFailed(1)
  }

  const { accessKey, secretKey, bucket, zone,
    fsizeLimit, mimeLimit } = getInput()

  try {
    const qiniu = new Quniu(accessKey, secretKey, bucket, zone, {
      fsizeLimit,
      mimeLimit
    })

    const summary = await diff()

    const op = {
      A: [],
      D: [],
      M: [],
      R: []
    }

    for (let index = 0; index < summary.length; index++) {
      const [status, o, d] = summary[index];
      op[status].push([o, d])
    }

    // 新增
    const adds = op.A
    for (let index = 0; index < adds.length; index++) {
      const [fs] = adds[index];
      qiniu.uploadFile(fs, path.resolve(__dirname, fs))
    }

    // 删除
    const dels = op.D
    qiniu.batchDelFiles(dels.map(fs => fs))

    // 重命名
    const renames = op.R
    qiniu.batchMVFiles(renames.map(fs => fs))
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

if (core.getState("isPost")) {
  run() 
} else {
  core.saveState("isPost", true);
}
