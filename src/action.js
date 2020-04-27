const path = require('path')
const core = require('@actions/core');
const diff = require('./diff')
const Quniu = require('./qiniu')
const { getInput, getWorkspace } = require('./input-helper')

async function run() {
  const githubWorkspacePath = getWorkspace()

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
  qiniu.batchUpFiles(modifies.map(([path]) => (path)))
}

async function main() {
  try {
    run()
  } catch (error) {
    core.setFailed(1)
  }
}

module.exports = main