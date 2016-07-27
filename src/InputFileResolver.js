"use strict";
var fileUtils_1 = require('./utils/fileUtils');
var _ = require('lodash');
var log4js = require('log4js');
var log = log4js.getLogger('InputFileResolver');
var DEFAULT_INPUT_FILE_PROPERTIES = { mutated: false, included: true };
var InputFileResolver = (function () {
    function InputFileResolver(mutate, allFileExpressions) {
        this.mutateFileExpressions = mutate || [];
        this.inputFileDescriptors = allFileExpressions.map(function (maybePattern) {
            if (InputFileResolver.isInputFileDescriptor(maybePattern)) {
                return maybePattern;
            }
            else {
                return _.assign({ pattern: maybePattern }, DEFAULT_INPUT_FILE_PROPERTIES);
            }
        });
    }
    InputFileResolver.prototype.resolve = function () {
        var mutateFilePromise = this.resolveMutateFileGlobs();
        return this.resolveInputFileGlobs().then(function (allInputFiles) { return mutateFilePromise.then(function (additionalMutateFiles) {
            InputFileResolver.markAdditionalFilesToMutate(allInputFiles, additionalMutateFiles);
            InputFileResolver.warnAboutNoFilesToMutate(allInputFiles);
            return allInputFiles;
        }); });
    };
    InputFileResolver.markAdditionalFilesToMutate = function (allInputFiles, additionalMutateFiles) {
        var errors = [];
        additionalMutateFiles.forEach(function (mutateFile) {
            if (!allInputFiles.filter(function (inputFile) { return inputFile.path === mutateFile; }).length) {
                errors.push("Could not find mutate file \"" + mutateFile + "\" in list of files.");
            }
        });
        if (errors.length > 0) {
            throw new Error(errors.join(' '));
        }
        allInputFiles.forEach(function (file) { return file.mutated = additionalMutateFiles.some(function (mutateFile) { return mutateFile === file.path; }) || file.mutated; });
    };
    InputFileResolver.warnAboutNoFilesToMutate = function (allInputFiles) {
        var mutateFiles = allInputFiles.filter(function (file) { return file.mutated; });
        if (mutateFiles.length) {
            log.info("Found " + mutateFiles.length + " file(s) to be mutated.");
        }
        else {
            log.warn("No files marked to be mutated, stryker will perform a dry-run without actually mutating anything.");
        }
    };
    InputFileResolver.reportEmptyGlobbingExpression = function (expression) {
        log.warn("Globbing expression \"" + expression + "\" did not result in any files.");
    };
    InputFileResolver.isInputFileDescriptor = function (maybeInputFileDescriptor) {
        if (_.isObject(maybeInputFileDescriptor)) {
            if (Object.keys(maybeInputFileDescriptor).indexOf('pattern') > -1) {
                return true;
            }
            else {
                throw Error("File descriptor " + JSON.stringify(maybeInputFileDescriptor) + " is missing mandatory property 'pattern'.");
            }
        }
        else {
            return false;
        }
    };
    InputFileResolver.prototype.resolveMutateFileGlobs = function () {
        return Promise.all(this.mutateFileExpressions.map(InputFileResolver.resolveFileGlob))
            .then(function (files) { return _.flatten(files); });
    };
    InputFileResolver.prototype.resolveInputFileGlobs = function () {
        return Promise.all(this.inputFileDescriptors.map(function (descriptor) { return InputFileResolver.resolveFileGlob(descriptor.pattern)
            .then(function (sourceFiles) { return sourceFiles.map(function (sourceFile) { return InputFileResolver.createInputFile(sourceFile, descriptor); }); }); })).then(function (promises) { return _.flatten(promises); });
    };
    InputFileResolver.createInputFile = function (path, descriptor) {
        var inputFile = _.assign({ path: path }, DEFAULT_INPUT_FILE_PROPERTIES, descriptor);
        delete inputFile['pattern'];
        return inputFile;
    };
    InputFileResolver.resolveFileGlob = function (expression) {
        var _this = this;
        return fileUtils_1.glob(expression).then(function (files) {
            if (files.length === 0) {
                _this.reportEmptyGlobbingExpression(expression);
            }
            fileUtils_1.normalize(files);
            return files;
        });
    };
    return InputFileResolver;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InputFileResolver;
//# sourceMappingURL=InputFileResolver.js.map