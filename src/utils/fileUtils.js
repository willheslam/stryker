'use strict';
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var nodeGlob = require('glob');
var mkdirp = require('mkdirp');
/**
 * Checks if a file or folder exists.
 * @function
 * @param path - The path to the file or folder.
 * @returns True if the file exists.
 */
function fileOrFolderExistsSync(path) {
    try {
        var stats = fs.lstatSync(path);
        return true;
    }
    catch (errror) {
        return false;
    }
}
exports.fileOrFolderExistsSync = fileOrFolderExistsSync;
;
function fileOrFolderExists(path) {
    return new Promise(function (resolve) {
        fs.lstat(path, function (error, stats) {
            resolve(!error);
        });
    });
}
exports.fileOrFolderExists = fileOrFolderExists;
/**
 * Reads a file.
 * @function
 * @param filename - The name of the file.
 * @returns The content of the file.
 */
function readFile(filename) {
    return fs.readFileSync(filename, 'utf8');
}
exports.readFile = readFile;
;
/**
   * Normalizes the paths of a list of filenames.
   * @param files - The list of filenames which have to be normalized.
   */
function normalize(files) {
    _.forEach(files, function (file, key) {
        files[key] = path.resolve(path.normalize(file));
    });
}
exports.normalize = normalize;
;
function glob(expression) {
    return new Promise(function (resolve, reject) {
        nodeGlob(expression, function (error, matches) {
            if (error) {
                reject(error);
            }
            else {
                resolve(matches);
            }
        });
    });
}
exports.glob = glob;
function readdir(path) {
    return new Promise(function (resolve, reject) {
        fs.readdir(path, function (error, files) {
            if (error) {
                reject(error);
            }
            else {
                resolve(files);
            }
        });
    });
}
exports.readdir = readdir;
function stats(path) {
    return new Promise(function (resolve, reject) {
        fs.stat(path, function (error, stats) {
            if (error) {
                reject(error);
            }
            else {
                resolve(stats);
            }
        });
    });
}
function rmFile(path) {
    return new Promise(function (fileResolve, fileReject) {
        fs.unlink(path, function (error) {
            if (error) {
                fileReject(error);
            }
            else {
                fileResolve();
            }
        });
    });
}
function rmdir(dirToDelete) {
    return new Promise(function (resolve, reject) {
        fs.rmdir(dirToDelete, function (error) {
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
 * Deletes a directory recursively
 */
function deleteDir(dirToDelete) {
    return fileOrFolderExists(dirToDelete).then(function (exists) {
        if (exists) {
            return readdir(dirToDelete).then(function (files) {
                var promisses = files.map(function (file) {
                    var currentPath = path.join(dirToDelete, file);
                    return stats(currentPath).then(function (stats) {
                        if (stats.isDirectory()) {
                            // recursive
                            return deleteDir(currentPath);
                        }
                        else {
                            // delete file
                            return rmFile(currentPath);
                        }
                    });
                });
                // delete dir
                return Promise.all(promisses).then(function () { return rmdir(dirToDelete); });
            });
        }
    });
}
exports.deleteDir = deleteDir;
function cleanFolder(folderName) {
    return fileOrFolderExists(folderName)
        .then(function (exists) {
        if (exists) {
            return deleteDir(folderName)
                .then(function () { return mkdirRecursive(folderName); });
        }
        else {
            return mkdirRecursive(folderName);
        }
    });
}
exports.cleanFolder = cleanFolder;
function writeFile(fileName, content) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(fileName, content, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
exports.writeFile = writeFile;
function mkdirRecursive(folderName) {
    if (!fileOrFolderExistsSync(folderName)) {
        mkdirp.sync(folderName);
    }
}
exports.mkdirRecursive = mkdirRecursive;
/**
 * Wrapper around the 'require' function (for testability)
 */
function importModule(moduleName) {
    require(moduleName);
}
exports.importModule = importModule;
//# sourceMappingURL=fileUtils.js.map