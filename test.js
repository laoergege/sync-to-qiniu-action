const path = require('path')

process.env.accessKey = 'QttzDFHUD4UN3cfL2pEG6hR2GEIWnqPRXJygKWXe'
process.env.secretKey = '08RMz4b7lLpJ-LpcfGRKJDwjaI6dhzFvkVvsm4vI'
process.env.bucket = 'laoergege-blog-images'
process.env.zone = 'Zone_z2'
process.env.folderPath = path.resolve(__dirname, './images')


const core = require('@actions/core');
const diff = require('./src/diff')``
const Quniu = require('./src/qiniu')
const { getInput, getWorkspace } = require('./src/input-helper')

async function run() {
  const githubWorkspacePath = getWorkspace()
  if (process.cwd() !== githubWorkspacePath) {
    core.setFailed(1)
  }

  const { accessKey, secretKey, bucket, zone,
    fsizeLimit, mimeLimit } = getInput()

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
  for (let index = 0; index < adds.length; index++) {
    const [fs] = adds[index];
    qiniu.uploadFile(fs, path.resolve(githubWorkspacePath, fs))
  }

  const dels = op.D
  qiniu.batchDelFiles(dels)

  const renames = op.R
  qiniu.batchMVFiles(renames)

  const modifies = op.M
  qiniu.batchUpFiles(modifies)
}

if (core.getState("isPost")) {
  run()
} else {
  core.saveState("isPost", true);
}
