const core = require('@actions/core');
const { getUpToken } = require('./qiniu')


// most @actions toolkit packages have async methods
async function run() {
  try { 
    // get the change of git
    // 资源管理，删除及重命名
    // 上传新的文件
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
