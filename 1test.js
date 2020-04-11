const dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)
console.log(dayjs.utc("2020-01-22T19:33:05Z").subtract(1, 'day').toString())