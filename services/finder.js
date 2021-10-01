const archiver = require('archiver')
const fs = require("fs")
const path = require('path');

const SH_REGEX = /.sh$/gi

const getFiles = async (path = "./") => {
    const entries = await fs.promises.readdir(path, { withFileTypes: true })

    const files = entries
        .filter(file => !file.isDirectory())
        .map(file => ({ full: `${path}${file.name}`, path, name: file.name }))

    const folders = entries.filter(folder => folder.isDirectory())

    for (const folder of folders)
        files.push(...await getFiles(`${path}${folder.name}/`))

    return files;
}

const filterFiles = regex => files => files.filter(f => f.name.match(regex))

const list = ({ basepath = './', regex = SH_REGEX }) => {
    return getFiles(basepath)
    .then(filterFiles(regex))
}

const zipDirectory = (source, out) => {
    const archive = archiver('zip', { zlib: { level: 9 }});
    return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(out);
        archive
            .directory(source, false)
            .on('error', err => reject(err))
            .pipe(stream)
        ;

        stream.on('close', () => resolve());
        archive.finalize();
    });
}

const purge = async (directory) => {
    return new Promise((resolve, reject) => {
        fs.readdir(directory, (err, files) => {
            reject(err)
            for (const file of files) {
                fs.unlink(path.join(directory, file), reject);
            }
        });
        resolve({message: 'ok'})
    });
    
}

module.exports = { list, zipDirectory, purge }

