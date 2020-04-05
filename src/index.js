const path = require('path')
const core = require('@actions/core');
const diff = require('./diff')
const Quniu = require('./qiniu')
const { getInput, getWorkspace } = require('./input-helper')

async function run() {
  const githubWorkspacePath = getWorkspace()
  if (process.cwd() !== githubWorkspacePath) {
    core.setFailed(1)
  }

  const { accessKey, secretKey, bucket, zone, folderPath,
    fsizeLimit, mimeLimit } = getInput()

  core.info(accessKey)
  core.info(secretKey)
  core.info(bucket)
  core.info(fsizeLimit)
  core.info(folderPath)

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

  const adds = op.A
  qiniu.batchUploadFiles(adds.map(([path]) => (path)))

  const dels = op.D
  qiniu.batchDelFiles(dels.map(([path]) => (path)))

  const renames = op.R
  qiniu.batchMVFiles(renames)

  const modifies = op.M
  qiniu.batchUpFiles(modifies)
}

if (core.getState("isPost")) {
  run()
} else {
  core.saveState("isPost", '1');
}
