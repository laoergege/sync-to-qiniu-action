const core = require('@actions/core');
const { getUpToken } = require('./qiniu')
const Quniu = require('./src/qiniu')
const { filename } = require('./src/utils')

// most @actions toolkit packages have async methods
async function run() {
  // 秘钥
  const accessKey = 'QttzDFHUD4UN3cfL2pEG6hR2GEIWnqPRXJygKWXe'
  const secretKey = '08RMz4b7lLpJ-LpcfGRKJDwjaI6dhzFvkVvsm4vI'
  // 上传空间
  const bucket = 'laoergege-blog-images'

  try {
    const qiniu = new Quniu(accessKey, secretKey, bucket, 'Zone_z2')

    const diff = require('./src/diff')

    const summary = await diff()

    const op = {
      A: [],
      C: [],
      D: [],
      M: [],
      R: [],
      T: [],
      U: [],
      X: []
    }

    for (let index = 0; index < summary.length; index++) {
      const [status, o, d] = summary[index];
      op[status].push([o, d])
    }

    // 新增
    const adds = op.A
    for (let index = 0; index < adds.length; index++) {
      const [fs] = adds[index];
      qiniu.uploadFile(filename(fs), path.resolve(__dirname, fs))
    }

    // 删除
    const dels = op.D
    qiniu.batchDelFiles(dels.map(fs => (filename(fs[0]))))

    // 重命名
    const renames = op.R
    qiniu.batchMVFiles(renames.map(fs => (filename(fs[0]))))
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
