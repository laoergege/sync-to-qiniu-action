const qiniu = require('qiniu')
const core = require('@actions/core');
const { stringify, isNonEmptyArray, sendReq, splitArrByCount } = require('./utils')
const { REQ_MAX_COUNT } = require('./constants')

class Qiniu {

    /**
     * 构建 Qiniu 实例
     * @param {*} accessKey 
     * @param {*} secretKey 
     * @param {*} bucket 默认上传空间
     * @param {*} zone 服务地区 Zone_z0：华东, Zone_z1: 华北, Zone_z2: 华南, Zone_na0: 北美
     * @param {*} policy 上传策略参数 通过不同参数来满足不同的业务需求，可以灵活地组织你所需要的上传凭证 参考 https://developer.qiniu.com/kodo/manual/1206/put-policy
     */
    constructor(accessKey, secretKey, bucket, zone, policy) {
        this.accessKey = accessKey
        this.secretKey = secretKey
        this.bucket = bucket 

        this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

        this.setToken(policy)

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
                  resolve({ respBody, respInfo });
                } else {
                  reject({ respBody, respInfo });
                }
            });
        })
    }

    /**
     * 删除文件
     * @param {string} path 
     */
    deleteFile(path) {
      return new Promise((resolve, reject) => {
        this.bucketManager.delete(this.bucket, path, function(err, respBody, respInfo) {
          if (err) {
            reject(err)
          } else {
            resolve({ respBody, respInfo })
          }
        });
      })
    }

    /**
     * 批量上传文件
     * @param {Array<string>} paths path 文件路径数组
     */
    async batchUploadFiles(paths) {
      if (!isNonEmptyArray(paths)) {
        return
      }

      let https = paths.map(([key, path]) => (() => {
        return this.uploadFile(key, path).then(() => (key))
      }))

      sendReq(https, REQ_MAX_COUNT, (err, res) => {
        if (isNonEmptyArray(res)) {
          core.info(`${stringify(res)} \n are uploaded successfully`)
        }
        if (isNonEmptyArray(err)) {
          core.error(`There are some files that upload failed，please manually upload them again:\n${stringify(err)}`)
        }
      })
    }

    /**
     * 批量删除文件
     * @param {Array<string>} paths 文件名数组
     */
    batchDelFiles(paths = []) {
        if (!isNonEmptyArray(paths)) {
          return
        }

        //每个operations的数量不可以超过1000个，如果总数量超过1000，需要分批发送
        const deleteOperations = splitArrByCount(paths.map((key) => (qiniu.rs.deleteOp(this.bucket, key))), 1000)
          .map(delopers => (() => {
            return new Promise((resolve, reject) => {
              this.bucketManager.batch(delopers, function(err, respBody, respInfo) {
                if (err) {
                  reject(err)
                } else {
                  // 200 is success, 298 is part success
                  if (parseInt(respInfo.statusCode / 100) == 2) {
                    reject(respBody.filter(item => item !== 200))
                  } else {
                    reject({
                      respInfo,
                      respBody
                    })
                  }
                  resolve()
                }
              });
            })
          }))

        sendReq(deleteOperations, REQ_MAX_COUNT, (err) => {
          if (isNonEmptyArray(err)) {
            core.error(`Something is wrong :\n${stringify(err)}`)
          } else {
            core.info('All are deleted successfully')
          }
        })
    }

    /**
     * 批量移动或者重命名文件
     * @param {Array<[src: string, dst: string]>} paths o: 源文件名， dest: 新文件名
     */
    batchMVFiles(paths = []) {
      if (!isNonEmptyArray(paths)) {
        return
      }

      //每个operations的数量不可以超过1000个，如果总数量超过1000，需要分批发送
      var moveOperations = splitArrByCount(paths.map(key => {
        const [src, dest] = key
        return qiniu.rs.moveOp(this.bucket, src, this.bucket, dest)
      }), 1000)
      .map(mvopers => (() => {
        return new Promise((resolve, reject) => {
          this.bucketManager.batch(mvopers, function(err, respBody, respInfo) {
            if (err) {
              reject(err)
            } else {
              // 200 is success, 298 is part success
              if (parseInt(respInfo.statusCode / 100) == 2) {
                reject(respBody.filter(item => item !== 200))
              } else {
                reject({
                  respInfo,
                  respBody
                })
              }
              resolve()
            }
          })
        })
      }));

      sendReq(moveOperations, REQ_MAX_COUNT,(err) => {
        if (isNonEmptyArray(err)) {
          core.error(`Something is wrong :\n${stringify(err)}`)
        } else {
          core.info('All are moved successfully')
        }  
      })
    }
    
    /**
     * 批量更新文件
     * @param {Array<string>} paths 文件路径数组
     */
    async batchUpFiles(paths) {
      if (!isNonEmptyArray(paths)) {
        return
      } 

      const upOperations = paths.map(path => (async () => {
        await this.deleteFile(path) // 删除旧文件
        await this.uploadFile(path, path) // 重新上传新文件

        return path
      }))

      sendReq(upOperations, REQ_MAX_COUNT, (err, res) => {
        if (isNonEmptyArray(res)) {
          core.info(`${stringify(res)} \n are updated successfully`)
        }
        if (isNonEmptyArray(err)) {
          core.error(`There are some files that update failed，please manually update them again:\n${stringify(err)}`)
        }  
      })
    }
}

module.exports = Qiniu