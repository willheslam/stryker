"use strict";
var test_runner_1 = require('stryker-api/test_runner');
var StrykerTempFolder_1 = require('./utils/StrykerTempFolder');
var IsolatedTestRunnerAdapterFactory_1 = require('./isolated-runner/IsolatedTestRunnerAdapterFactory');
var path = require('path');
var os = require('os');
var _ = require('lodash');
var report_1 = require('stryker-api/report');
var log4js = require('log4js');
var objectUtils_1 = require('./utils/objectUtils');
var PromisePool = require('es6-promise-pool');
var log = log4js.getLogger('TestRunnerOrchestrator');
var TestRunnerOrchestrator = (function () {
    function TestRunnerOrchestrator(options, files, testSelector, reporter) {
        this.options = options;
        this.files = files;
        this.testSelector = testSelector;
        this.reporter = reporter;
    }
    TestRunnerOrchestrator.prototype.initialRun = function () {
        if (this.testSelector) {
            return this.initialRunWithTestSelector();
        }
        else {
            return this.initalRunWithoutTestSelector();
        }
    };
    TestRunnerOrchestrator.prototype.initalRunWithoutTestSelector = function () {
        var testRunner = this.createTestRunner(this.files, true);
        return testRunner.init().then(function () { return testRunner.run({ timeout: 10000 }).then(function (testResults) {
            testRunner.dispose();
            return [testResults];
        }); });
    };
    TestRunnerOrchestrator.prototype.initialRunWithTestSelector = function () {
        var _this = this;
        var testSelectionFilePath = this.createTestSelectorFileName(this.createTempFolder());
        var runner = this.createTestRunner(this.files, true, testSelectionFilePath);
        var sandbox = {
            runner: runner,
            fileMap: null,
            testSelectionFilePath: testSelectionFilePath,
            index: 0
        };
        return sandbox.runner.init().then(function () { return _this.runSingleTestsRecursive(sandbox, [], 0).then(function (testResults) { return runner.dispose().then(function () { return testResults; }); }); });
    };
    TestRunnerOrchestrator.prototype.runMutations = function (mutants) {
        var _this = this;
        mutants = _.clone(mutants); // work with a copy because we're changing state (pop'ing values)
        var results = [];
        return this.createTestRunnerSandboxes().then(function (sandboxes) {
            var promiseProducer = function () {
                if (mutants.length === 0) {
                    return null; // we're done
                }
                else {
                    var mutant = mutants.pop();
                    if (mutant.scopedTestIds.length > 0) {
                        var sandbox_1 = sandboxes.pop();
                        var sourceFileCopy_1 = sandbox_1.fileMap[mutant.filename];
                        return Promise.all([mutant.save(sourceFileCopy_1), _this.selectTestsIfPossible(sandbox_1, mutant.scopedTestIds)])
                            .then(function () { return sandbox_1.runner.run({ timeout: _this.calculateTimeout(mutant.timeSpentScopedTests) }); })
                            .then(function (runResult) {
                            var result = _this.collectFrozenMutantResult(mutant, runResult);
                            results.push(result);
                            _this.reporter.onMutantTested(result);
                            return mutant.reset(sourceFileCopy_1);
                        })
                            .then(function () { return sandboxes.push(sandbox_1); }); // mark the runner as available again
                    }
                    else {
                        var result = _this.collectFrozenMutantResult(mutant);
                        results.push(result);
                        return Promise.resolve(_this.reporter.onMutantTested(result));
                    }
                }
            };
            return new PromisePool(promiseProducer, sandboxes.length)
                .start()
                .then(function () { return _this.reportAllMutantsTested(results); })
                .then(function () { return Promise.all(sandboxes.map(function (testRunner) { return testRunner.runner.dispose(); })); })
                .then(function () { return results; });
        });
    };
    TestRunnerOrchestrator.prototype.reportAllMutantsTested = function (results) {
        objectUtils_1.freezeRecursively(results);
        this.reporter.onAllMutantsTested(results);
    };
    TestRunnerOrchestrator.prototype.calculateTimeout = function (baseTimeout) {
        return (this.options.timeoutFactor * baseTimeout) + this.options.timeoutMs;
    };
    TestRunnerOrchestrator.prototype.collectFrozenMutantResult = function (mutant, runResult) {
        var status;
        var testNames;
        if (runResult) {
            switch (runResult.result) {
                case test_runner_1.TestResult.Timeout:
                    status = report_1.MutantStatus.TIMEDOUT;
                    break;
                case test_runner_1.TestResult.Error:
                    log.debug('Converting a test result `error` to mutant status `killed`.');
                    status = report_1.MutantStatus.KILLED;
                    break;
                case test_runner_1.TestResult.Complete:
                    if (runResult.failed > 0) {
                        status = report_1.MutantStatus.KILLED;
                    }
                    else {
                        status = report_1.MutantStatus.SURVIVED;
                    }
                    break;
            }
            testNames = runResult.testNames;
        }
        else {
            testNames = [];
            status = report_1.MutantStatus.UNTESTED;
        }
        var result = {
            sourceFilePath: mutant.filename,
            mutatorName: mutant.mutatorName,
            status: status,
            replacement: mutant.replacement,
            location: mutant.location,
            range: mutant.range,
            testsRan: testNames,
            originalLines: mutant.originalLines,
            mutatedLines: mutant.mutatedLines,
        };
        objectUtils_1.freezeRecursively(result);
        return result;
    };
    TestRunnerOrchestrator.prototype.runSingleTestsRecursive = function (sandbox, runResults, currentTestIndex) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.selectTestsIfPossible(sandbox, [currentTestIndex])
                .then(function () { return sandbox.runner.run({ timeout: 10000 }); })
                .then(function (runResult) {
                if (runResult.result === test_runner_1.TestResult.Complete && runResult.succeeded > 0 || runResult.failed > 0) {
                    runResults[currentTestIndex] = runResult;
                    resolve(_this.runSingleTestsRecursive(sandbox, runResults, currentTestIndex + 1));
                }
                else {
                    if (runResult.result !== test_runner_1.TestResult.Complete) {
                        // If this was iteration n+1 (n = number of tests), the runResult.result will be Complete, so we don't record it
                        runResults[currentTestIndex] = runResult;
                    }
                    sandbox.runner.dispose();
                    resolve(runResults);
                }
            });
        });
    };
    TestRunnerOrchestrator.prototype.createTestRunnerSandboxes = function () {
        var cpuCount = os.cpus().length;
        var testRunnerSandboxes = [];
        var allPromises = [];
        log.info("Creating " + cpuCount + " test runners (based on cpu count)");
        for (var i = 0; i < cpuCount; i++) {
            allPromises.push(this.createInitializedSandbox(i));
        }
        return Promise.all(allPromises);
    };
    TestRunnerOrchestrator.prototype.selectTestsIfPossible = function (sandbox, ids) {
        if (this.testSelector) {
            var fileContent = this.testSelector.select(ids);
            return StrykerTempFolder_1.default.writeFile(sandbox.testSelectionFilePath, fileContent);
        }
        else {
            return Promise.resolve(void 0);
        }
    };
    TestRunnerOrchestrator.prototype.createInitializedSandbox = function (index) {
        var _this = this;
        var tempFolder = this.createTempFolder();
        return this.copyAllFilesToFolder(tempFolder).then(function (fileMap) {
            var testSelectionFilePath = null;
            if (_this.testSelector) {
                testSelectionFilePath = _this.createTestSelectorFileName(tempFolder);
            }
            var runnerFiles = _this.files.map(function (originalFile) { return _.assign(_.cloneDeep(originalFile), { path: fileMap[originalFile.path] }); });
            var runner = _this.createTestRunner(runnerFiles, false, testSelectionFilePath, index);
            return runner.init().then(function () { return ({ index: index, fileMap: fileMap, runner: runner, testSelectionFilePath: testSelectionFilePath }); });
        });
    };
    TestRunnerOrchestrator.prototype.createTempFolder = function () {
        var tempFolder = StrykerTempFolder_1.default.createRandomFolder('test-runner-files');
        log.debug('Creating a sandbox for files in %s', tempFolder);
        return tempFolder;
    };
    TestRunnerOrchestrator.prototype.createTestSelectorFileName = function (folder) {
        return path.join(folder, '___testSelection.js');
    };
    TestRunnerOrchestrator.prototype.copyAllFilesToFolder = function (folder) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var fileMap = Object.create(null);
            var cwd = process.cwd();
            var copyPromises = _this.files.map(function (file) {
                var relativePath = file.path.substr(cwd.length);
                var folderName = StrykerTempFolder_1.default.ensureFolderExists(folder + path.dirname(relativePath));
                var targetFile = path.join(folderName, path.basename(relativePath));
                fileMap[file.path] = targetFile;
                return StrykerTempFolder_1.default.copyFile(file.path, targetFile);
            });
            Promise.all(copyPromises).then(function () { resolve(fileMap); }, reject);
        });
    };
    TestRunnerOrchestrator.prototype.createTestRunner = function (files, coverageEnabled, testSelectionFilePath, index) {
        if (index === void 0) { index = 0; }
        if (testSelectionFilePath) {
            files = [{ path: testSelectionFilePath, mutated: false, included: true }].concat(files);
        }
        var settings = {
            coverageEnabled: coverageEnabled,
            files: files,
            strykerOptions: this.options,
            port: this.options.port + index
        };
        log.debug("Creating test runner %s using settings {port: %s, coverageEnabled: %s}", index, settings.port, settings.coverageEnabled);
        return IsolatedTestRunnerAdapterFactory_1.default.create(settings);
    };
    return TestRunnerOrchestrator;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TestRunnerOrchestrator;
//# sourceMappingURL=TestRunnerOrchestrator.js.map