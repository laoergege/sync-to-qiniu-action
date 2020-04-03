const qiniu = require('qiniu')
const core = require('@actions/core');

class Qiniu {

    /**
     * 构建 Qiniu 实例
     * @param {*} accessKey 
     * @param {*} secretKey 
     * @param {*} bucket 上传空间
     * @param {*} zone 服务地区 Zone_z0：华东, Zone_z1: 华北, Zone_z2: 华南, Zone_na0: 北美
     */
    constructor(accessKey, secretKey, bucket, zone) {
        this.accessKey = accessKey
        this.secretKey = secretKey
        this.bucket = bucket 

        this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

        this.setToken()

        this.config = new qiniu.conf.Config()
        this.config.zone = qiniu.zone[zone];

        this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.onfig);
    }

    /**
     * 获取上传凭证
     * @param  {*} res 上传策略参数 通过不同参数来满足不同的业务需求，可以灵活地组织你所需要的上传凭证 参考 https://developer.qiniu.com/kodo/manual/1206/put-policy
     * @returns token
     */
    getUpToken(res) {
        //自定义凭证有效期（示例2小时，expires单位为秒，为上传凭证的有效时间）
        const options = {
            scope: this.bucket,
            expires: 7200,
            ...res
        };

        const putPolicy = new qiniu.rs.PutPolicy(options);
        return putPolicy.uploadToken(this.mac);
    }

    setToken(res = {}) {
        this.token = this.getUpToken(res) 
    }

    /**
     * 上传文件
     * @param {*} key 文件命名
     * @param {*} filePath 文件路径
     * @returns 
     */
    uploadFile(key, filePath) {

        const formUploader = new qiniu.form_up.FormUploader(this.config);
        const putExtra = new qiniu.form_up.PutExtra();

        return new Promise((resolve, reject) => {
            // 文件上传
            formUploader.putFile(this.token, key, filePath, putExtra, function (respErr,
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

    batchDelFiles(keys = []) {
        if (!Array.isArray(keys) || keys.length === 0) {
          return
        }

        const deleteOperations = keys.map((key) => (qiniu.rs.deleteOp(this.bucket, key)))

        this.bucketManager.batch(deleteOperations, function(err, respBody, respInfo) {
            if (err) {
              core.error(err);
              //throw err;
            } else {
              // 200 is success, 298 is part success
              if (parseInt(respInfo.statusCode / 100) == 2) {
                respBody.forEach(function(item) {
                  if (item.code == 200) {
                    core.info(item.code + "\tsuccess");
                  } else {
                    core.error(item.code + "\t" + item.data.error);
                  }
                });
              } else {
                core.info(respInfo.deleteusCode)
                core.info(respBody)
              }
            }
          });
    }
}

module.exports = Qiniu