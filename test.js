const path = require('path')

process.env['INPUT_accessKey'] = 'QttzDFHUD4UN3cfL2pEG6hR2GEIWnqPRXJygKWXe'
process.env['INPUT_secretKey'] = '08RMz4b7lLpJ-LpcfGRKJDwjaI6dhzFvkVvsm4vI'
process.env['INPUT_bucket'] = 'laoergege-blog-images'
process.env['INPUT_zone'] = 'Zone_z2'
process.env['INPUT_folderPath'] = 'images'
process.env['GITHUB_WORKSPACE'] = __dirname

const core = require('@actions/core');
const diff = require('./src/diff')
const Quniu = require('./src/qiniu')
const { getInput, getWorkspace } = require('./src/input-helper')

async function run() {
  const githubWorkspacePath = getWorkspace()
  if (process.cwd() !== githubWorkspacePath) {
    core.setFailed(1)
  }

  const { accessKey, secretKey, bucket, zone,
    fsizeLimit, mimeLimit } = getInput()

  const policy = {
    fsizeLimit: Number(fsizeLimit),
    mimeLimit
  }

  Object.keys(policy).map((key) => {
    if (!policy[key]) {
      delete policy[key]
    }
  })

  const qiniu = new Quniu(accessKey, secretKey, bucket, zone, policy)

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
  qiniu.batchUploadFiles(adds.map(([p]) => ([p, path.resolve(githubWorkspacePath, p)])))

  const dels = op.D
  qiniu.batchDelFiles(dels.map(([path]) => (path)))

  const renames = op.R
  qiniu.batchMVFiles(renames)

  const modifies = op.M
  qiniu.batchUpFiles(modifies)
}

run()