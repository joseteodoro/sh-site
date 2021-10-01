const config =  {
    basepath: process.env.BASE_PATH || 'scripts/',
    regex: '(.sh)$',
    user: 'apoio',
    password: 'talend',
    notification: {
        before: {
            url: 'https://bananaphone.free.beeceptor.com/before'
        },
        after: {
            url: 'https://bananaphone.free.beeceptor.com/after'
        },
        error: {
            url: 'https://bananaphone.free.beeceptor.com/error'
        }
    },
    etl: {
        timeout: 15
    },
    redis: {
        host: '',
        port: '6379',
        password: ''
    }
}

module.exports = config