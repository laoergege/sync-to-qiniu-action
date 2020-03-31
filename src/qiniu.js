const qiniu = require('qiniu')
const core = require('@actions/core');

// 生成凭证
const accessKey = 'QttzDFHUD4UN3cfL2pEG6hR2GEIWnqPRXJygKWXe'
const secretKey = '08RMz4b7lLpJ-LpcfGRKJDwjaI6dhzFvkVvsm4vI'
// 上传空间
const bucket = 'laoergege-blog-images'

/**
 * 获取上传凭证
 * @param  {...any} res 上传策略参数 通过不同参数来满足不同的业务需求，可以灵活地组织你所需要的上传凭证 参考 https://developer.qiniu.com/kodo/manual/1206/put-policy
 * @returns token
 */
function getUpToken(...res) {
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

    //自定义凭证有效期（示例2小时，expires单位为秒，为上传凭证的有效时间）
    const options = {
        scope: bucket,
        expires: 7200,
        ...res
    };

    const putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(mac);
}

/**
 * 上传文件
 * @param {*} token 上传凭据
 * @param {*} key 文件命名
 * @param {*} filePath 文件路径
 * @returns 
 */
function uploadFile(token, key, filePath) {
    const config = new qiniu.conf.Config()
    // 空间对应的机房
    config.zone = qiniu.zone.Zone_z2;
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();

    return new Promise((resolve, reject) => {
        // 文件上传
        formUploader.putFile(token, key, filePath, putExtra, function (respErr,
            respBody, respInfo) {
            if (respErr) {
                reject(respErr);
            }
            if (respInfo.statusCode == 200) {
                resolve(respBody);
            } else {
                core.info(respInfo.statusCode);
                core.info(respBody);
            }
        });
    })
}

module.exports = {
    getUpToken,
    uploadFile
}