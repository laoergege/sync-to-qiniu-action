const Quniu = require('./src/qiniu')
const { filename } = require('./src/utils')
const path = require('path')

// input
process.env['INPUT_FOLDERPATH'] = 'images'

// 秘钥
const accessKey = 'QttzDFHUD4UN3cfL2pEG6hR2GEIWnqPRXJygKWXe'
const secretKey = '08RMz4b7lLpJ-LpcfGRKJDwjaI6dhzFvkVvsm4vI'
// 上传空间
const bucket = 'laoergege-blog-images'

async function test() {
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
        const [ status, of, nf ] = summary[index];
        op[status].push([of, nf])
    }

    // 新增
    const adds = op.A
    for (let index = 0; index < adds.length; index++) {
        const [fs] = adds[index];
        qiniu.uploadFile(filename(fs), path.resolve(__dirname, fs))
    }

    // 删除
    const dels = op.D
    qiniu.batchDelFiles(dels.map(fs => (filename(fs))))
    
}

test()
