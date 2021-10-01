const redis = require('redis')
const config = require('../config')

const connect = () => {
    const { host, port, password } = config.redis
    return redis.createClient({ host, port, password });
}

const flush = () => {
    return new Promise((resolve, reject) => {
        const client = connect()
        client.on("error", function(err) {
            console.log(`Error calling redis: ${err}`)
        });
        client.flushall('ASYNC', function (err, succeeded) {
            if (err) {
                return reject(err)
            }
            return resolve(succeeded)
        });
    })
}

module.exports = { flush }