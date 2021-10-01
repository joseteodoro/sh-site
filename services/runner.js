const { trace } = require('console');
const fs = require('fs')
const moment = require('moment')
const uuid  = require('uuid').v4
const util = require('util');
// const { basepath } = require('../config');
// const exec = util.promisify(require('child_process').exec);
const config = require('../config')
const finder = require('./finder')
const { send } = require('./notification')

const extract = (field) => item => item[field]

const sanitize = cmd => cmd
    .replace('/', '-')
    .replace(' ', '-')

const format = (cmd) => `cd "${config.basepath}"; ./"${cmd}"`

// bash -c 'cd ~/Developer/nexa/sh-site/scripts; ./test.sh'

// const format = (cmd) => `pwd`

const notifyStart = (etl) => {
    return config.notification.before
        ? send(config.notification.before, { etl, state: 'Starting' })
        : Promise.resolve({})
}

const notifyEnd = (etl) => {
    return config.notification.after
        ? send(config.notification.after, { etl, state: 'Finished' })
        : Promise.resolve({})
}

const notifyError = (etl) => {
    return config.notification.error
        ? send(config.notification.error, { etl, state: 'Failed' })
        : Promise.resolve({})
}

const timedRun = (cmd, log, seconds = 360) => {
    return new Promise((resolve, reject) => {
        const spawn = require('child_process').spawn;
        const child = spawn('bash', ['-c',format(cmd)], {detached: true});
        const timeout = setTimeout(() => {
            try {
                process.kill(-child.pid, 'SIGKILL');
                fs.appendFileSync(log, `Script failed:\n\n`)
                fs.appendFileSync(log, `Script timedout after ${seconds} seconds`);
                notifyError(cmd)
            } catch (e) {
                fs.appendFileSync(log, `Cannot kill process. ${e.toString()}`)
            }
            },
            seconds*1000
        );

        child.on('error', err => {
            fs.appendFileSync(log, err.toString());
            reject({});
        });
        child.on('exit', () => {
            clearTimeout(timeout);
            notifyEnd(cmd);
            resolve({});
        });
        child.stdout.on('data', data => fs.appendFileSync(log, data));
        child.stderr.on('data', _ => {
            notifyError(cmd)
            fs.appendFileSync(log, `Script failed:\n\n`)
        });
        child.stderr.on('data', data => fs.appendFileSync(log, data));
    });
}

const traceExecution = async (entry) => {
    return new Promise((resolve, reject) => {
        const file = `./static/running/${entry}`
        try {
            fs.writeFileSync(file, '');
            resolve({})
        } catch(err){
            reject(err)
        }
    })
}

const untraceExecution = async (entry) => {
    return new Promise((resolve, reject) => {
        const file = `./static/running/${entry}`
        try {
            fs.unlinkSync(file);
            resolve({})
        } catch(err){
            reject(err)
        }
    })
}

const fireAndForget = fn => Promise.resolve({})
    .then(_ => {
        fn()
        return {ok: true}
    })

const run = (cmd) => fireAndForget(() => {
        const entry = `${new Date().valueOf()}-${sanitize(cmd)}`
        const log = `./static/logs/${entry}.log`
        return traceExecution(entry)
            .then(() => notifyStart(cmd))
            .then(() => timedRun(cmd, log, config.etl.timeout))
            .then(() => untraceExecution(entry))
            .catch(console.log)
            .then(entry)
    })

const history = () => {
    const basepath = 'static/logs/'
    return finder.list({ basepath, regex: '.log' })
    .then(files => files.map(extract('full')))
    .then(paths => paths.map(p => p.replace(basepath, '')))
}

const jobs = () => finder.list({ basepath: config.basepath, regex: config.regex })
    .then(files => files.map(extract('full')))
    .then(paths => paths.map(p => p.replace(config.basepath, '')))

const DATE_REGEX = /^([0-9]+)/

const extractDate = logentry => {
    const epoch = DATE_REGEX.exec(logentry).pop()
    return moment(parseInt(epoch, 10)).format()
}

const purge = () => {
    const basepath = 'static/logs/'
    // const entry = `${new Date().valueOf()}-${uuid()}.zip`
    // const output = `static/logs/${entry}`
    // return finder.zipDirectory(basepath, output)
    //     .then(() => finder.purge(basepath))
    return finder.purge(basepath)
}

module.exports = { jobs, run, history, extractDate, purge }