function stringify(obj) {
    return JSON.stringify(obj, null, 2)
}

function isNonEmptyArray(arr) {
    return Array.isArray(arr) && arr.length !== 0
}

function sendReq(https, max, callback) {
    let i = max;
    callback.successRES = callback.successRES || []
    callback.failedRES = callback.failedRES || []
    callback.max = callback.max || https.length
    
    while ( i > 0 && https.length !== 0) {
        i--;
        let t = https.pop()
        t().then((res) => {
            callback.successRES.push(res)
            if (https.length !== 0) {
                sendReq(https, 1, callback)
            }     
        })
        .catch((res) => {
            callback.failedRES.push(res)
            if (https.length !== 0) {
                sendReq(https, 1, callback)
            } 
        })
        .finally(() => {
            if ((callback.successRES.length + callback.failedRES.length) === callback.max) {
                callback(callback.failedRES, callback.successRES)
            }
        })
    }
}

/**
 * 分割数组
 * @param {*} array 
 * @param {*} len 
 */
function splitArrByCount(array, len) {
    const result = []
    let i = 0
    while (i < array.length) {
        result.push(array.slice(i, i = len + i))
    }
    return result
}

module.exports = {
    stringify,
    isNonEmptyArray,
    sendReq,
    splitArrByCount
}