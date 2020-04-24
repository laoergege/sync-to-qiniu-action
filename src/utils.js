function stringify(obj) {
    return JSON.stringify(obj)
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

module.exports = {
    stringify,
    isNonEmptyArray,
    sendReq
}