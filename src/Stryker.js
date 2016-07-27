'use strict';
var _ = require('lodash');
var MutatorOrchestrator_1 = require('./MutatorOrchestrator');
var config_1 = require('stryker-api/config');
var TestRunnerOrchestrator_1 = require('./TestRunnerOrchestrator');
var ReporterOrchestrator_1 = require('./ReporterOrchestrator');
require('./jasmine_test_selector/JasmineTestSelector');
var test_runner_1 = require('stryker-api/test_runner');
var TestSelectorOrchestrator_1 = require('./TestSelectorOrchestrator');
var MutantRunResultMatcher_1 = require('./MutantRunResultMatcher');
var InputFileResolver_1 = require('./InputFileResolver');
var ConfigReader_1 = require('./ConfigReader');
var PluginLoader_1 = require('./PluginLoader');
var objectUtils_1 = require('./utils/objectUtils');
var StrykerTempFolder_1 = require('./utils/StrykerTempFolder');
var log4js = require('log4js');
var log = log4js.getLogger('Stryker');
var Stryker = (function () {
    /**
     * The Stryker mutation tester.
     * @constructor
     * @param {String[]} mutateFilePatterns - A comma seperated list of globbing expression used for selecting the files that should be mutated
     * @param {String[]} allFilePatterns - A comma seperated list of globbing expression used for selecting all files needed to run the tests. These include library files, test files and files to mutate, but should NOT include test framework files (for example jasmine)
     * @param {Object} [options] - Optional options.
     */
    function Stryker(options) {
        var configReader = new ConfigReader_1.default(options);
        this.config = configReader.readConfig();
        this.setGlobalLogLevel(); // loglevel could be changed
        this.loadPlugins();
        this.applyConfigWriters();
        this.setGlobalLogLevel(); // loglevel could be changed
        this.freezeConfig();
    }
    /**
     * Runs mutation testing. This may take a while.
     * @function
     */
    Stryker.prototype.runMutationTest = function () {
        var _this = this;
        var reporter = new ReporterOrchestrator_1.default(this.config).createBroadcastReporter();
        var testSelector = new TestSelectorOrchestrator_1.default(this.config).determineTestSelector();
        return new InputFileResolver_1.default(this.config.mutate, this.config.files).resolve()
            .then(function (inputFiles) {
            var testRunnerOrchestrator = new TestRunnerOrchestrator_1.default(_this.config, inputFiles, testSelector, reporter);
            return testRunnerOrchestrator.initialRun().then(function (runResults) { return ({ runResults: runResults, inputFiles: inputFiles, testRunnerOrchestrator: testRunnerOrchestrator }); });
        })
            .then(function (tuple) {
            var runResults = tuple.runResults;
            var inputFiles = tuple.inputFiles;
            var testRunnerOrchestrator = tuple.testRunnerOrchestrator;
            var unsuccessfulTests = _this.filterOutUnsuccesfulResults(runResults);
            if (unsuccessfulTests.length === 0) {
                _this.logInitialTestRunSucceeded(runResults);
                var mutatorOrchestrator = new MutatorOrchestrator_1.default(reporter);
                var mutants = mutatorOrchestrator.generateMutants(inputFiles
                    .filter(function (inputFile) { return inputFile.mutated; })
                    .map(function (file) { return file.path; }));
                log.info(mutants.length + " Mutant(s) generated");
                var mutantRunResultMatcher = new MutantRunResultMatcher_1.default(mutants, runResults);
                mutantRunResultMatcher.matchWithMutants();
                return testRunnerOrchestrator.runMutations(mutants);
            }
            else {
                _this.logFailedTests(unsuccessfulTests);
                throw new Error('There were failed tests in the initial test run');
            }
        }).then(function (mutantResults) {
            var maybePromise = reporter.wrapUp();
            if (objectUtils_1.isPromise(maybePromise)) {
                return maybePromise.then(function () { return mutantResults; });
            }
            else {
                return mutantResults;
            }
        }).then(function (mutantResults) { return StrykerTempFolder_1.default.clean().then(function () { return mutantResults; }); });
    };
    Stryker.prototype.filterOutUnsuccesfulResults = function (runResults) {
        return runResults.filter(function (runResult) { return !(!runResult.failed && runResult.result === test_runner_1.TestResult.Complete); });
    };
    Stryker.prototype.loadPlugins = function () {
        if (this.config.plugins) {
            new PluginLoader_1.default(this.config.plugins).load();
        }
    };
    Stryker.prototype.applyConfigWriters = function () {
        var _this = this;
        config_1.ConfigWriterFactory.instance().knownNames().forEach(function (configWriterName) {
            config_1.ConfigWriterFactory.instance().create(configWriterName, undefined).write(_this.config);
        });
    };
    Stryker.prototype.freezeConfig = function () {
        objectUtils_1.freezeRecursively(this.config);
        if (log.isDebugEnabled()) {
            log.debug("Using config: " + JSON.stringify(this.config));
        }
    };
    Stryker.prototype.logInitialTestRunSucceeded = function (runResults) {
        var totalAmountOfTests = 0;
        runResults.forEach(function (result) {
            if (result.succeeded) {
                totalAmountOfTests += result.succeeded;
            }
        });
        log.info('Initial test run succeeded. Ran %s tests.', totalAmountOfTests);
    };
    Stryker.prototype.setGlobalLogLevel = function () {
        log4js.setGlobalLogLevel(this.config.logLevel);
    };
    /**
     * Looks through a list of RunResults to see if all tests have passed.
     * @function
     * @param {RunResult[]} runResults - The list of RunResults.
     * @returns {Boolean} True if all tests passed.
     */
    Stryker.prototype.logFailedTests = function (unsuccessfulTests) {
        var failedSpecNames = _.uniq(_.flatten(unsuccessfulTests
            .filter(function (runResult) { return runResult.result === test_runner_1.TestResult.Complete; })
            .map(function (runResult) { return runResult.testNames; })))
            .sort();
        if (failedSpecNames.length > 0) {
            var message_1 = 'One or more tests failed in the inial test run:';
            failedSpecNames.forEach(function (filename) { return message_1 += "\n\t" + filename; });
            log.error(message_1);
        }
        var errors = _.flatten(unsuccessfulTests
            .filter(function (runResult) { return runResult.result === test_runner_1.TestResult.Error; })
            .map(function (runResult) { return runResult.errorMessages; }))
            .sort();
        if (errors.length > 0) {
            var message_2 = 'One or more tests errored in the initial test run:';
            errors.forEach(function (error) { return message_2 += "\n\t" + error; });
            log.error(message_2);
        }
    };
    return Stryker;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Stryker;
//# sourceMappingURL=Stryker.js.map