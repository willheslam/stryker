"use strict";
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var fileUtils = require('./fileUtils');
var log4js = require('log4js');
var log = log4js.getLogger('fileUtils');
var baseTempFolder = path.join(process.cwd(), '.stryker-tmp');
var tempFolder = path.join(baseTempFolder, random().toString());
ensureFolderExists(baseTempFolder);
ensureFolderExists(tempFolder);
/**
 * Creates a new random folder with the specified prefix.
 * @param prefix The prefix.
 * @returns The path to the folder.
 */
function createRandomFolder(prefix) {
    return ensureFolderExists(tempFolder + path.sep + prefix + random());
}
/**
 * Creates a random integer number.
 * @returns A random integer.
 */
function random() {
    return Math.ceil(Math.random() * 10000000);
}
/**
 * Creates a folder at the specified path if it doesn't already exist.
 * @param path The path to check.
 * @returns The path of the folder.
 */
function ensureFolderExists(path) {
    if (!fileOrFolderExists(path)) {
        mkdirp.sync(path);
    }
    return path;
}
/**
 * Checks if a file or folder exists.
 * @param path The path to the file or folder.
 * @returns True if the file exists.
 */
function fileOrFolderExists(path) {
    try {
        var stats = fs.lstatSync(path);
        return true;
    }
    catch (error) {
        return false;
    }
}
/**
 * Writes data to a specified file.
 * @param filename The path to the file.
 * @param data The content of the file.
 * @returns A promise to eventually save the file.
 */
function writeFile(filename, data) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(filename, data, { encoding: 'utf8' }, function (error) {
            if (error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
}
/**
 * Copies a file.
 * @param fromFilename The path to the existing file.
 * @param toFilename The path to copy the file to.
 * @returns A promise to eventually copy the file.
 */
function copyFile(fromFilename, toFilename) {
    return new Promise(function (resolve, reject) {
        var readStream = fs.createReadStream(fromFilename, { encoding: 'utf8' });
        var writeStream = fs.createWriteStream(toFilename, { encoding: 'utf8' });
        readStream.on('error', reject);
        writeStream.on('error', reject);
        readStream.pipe(writeStream);
        readStream.on('end', function () { return resolve(); });
    });
}
/**
 * Deletes the Stryker-temp folder
 */
function clean() {
    log.info("Cleaning stryker temp folder " + baseTempFolder);
    return fileUtils.deleteDir(baseTempFolder);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    createRandomFolder: createRandomFolder,
    writeFile: writeFile,
    copyFile: copyFile,
    ensureFolderExists: ensureFolderExists,
    clean: clean
};
//# sourceMappingURL=StrykerTempFolder.js.map