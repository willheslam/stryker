"use strict";
var test_selector_1 = require('stryker-api/test_selector');
var log4js = require('log4js');
var WARNING_RUNNING_WITHOUT_SELECTOR = 'Stryker will continue without the ability to select individual tests, thus running all test for every generated mutant.';
var IGNORE_WARNING = 'Set `testSelector` option explicitly to `null` to ignore this warning.';
var log = log4js.getLogger('TestSelectorOrchestrator');
var TestSelectorOrchestrator = (function () {
    function TestSelectorOrchestrator(options) {
        this.options = options;
    }
    TestSelectorOrchestrator.prototype.determineTestSelector = function () {
        var testSelector = null;
        if (this.options.testSelector && this.options.testSelector !== 'null') {
            testSelector = this.determineTestSelectorBasedOnTestSelectorSetting();
        }
        else if (this.options.testSelector === null || this.options.testSelector === 'null') {
            log.debug('Running without testSelector (testSelector was null).');
        }
        else {
            if (this.options.testFramework) {
                testSelector = this.determineTestSelectorBasedOnTestFrameworkSetting();
            }
            else {
                log.warn("Missing config settings `testFramework` or `testSelector`. " + WARNING_RUNNING_WITHOUT_SELECTOR + " " + IGNORE_WARNING);
            }
        }
        return testSelector;
    };
    TestSelectorOrchestrator.prototype.determineTestSelectorBasedOnTestSelectorSetting = function () {
        if (this.testSelectorExists(this.options.testSelector)) {
            log.debug("Using testSelector " + this.options.testSelector + " based on `testSelector` setting");
            return this.createTestSelector(this.options.testSelector);
        }
        else {
            log.warn("Could not find test selector `" + this.options.testSelector + "`. " + WARNING_RUNNING_WITHOUT_SELECTOR + " " + this.informAboutKnownTestSelectors());
            return null;
        }
    };
    TestSelectorOrchestrator.prototype.determineTestSelectorBasedOnTestFrameworkSetting = function () {
        if (this.testSelectorExists(this.options.testFramework)) {
            log.debug("Using testSelector " + this.options.testFramework + " based on `testFramework` setting");
            return this.createTestSelector(this.options.testFramework);
        }
        else {
            log.warn("Could not find test selector `" + this.options.testFramework + "` (based on the configured testFramework). " + WARNING_RUNNING_WITHOUT_SELECTOR + " " + IGNORE_WARNING + " " + this.informAboutKnownTestSelectors());
            return null;
        }
    };
    TestSelectorOrchestrator.prototype.informAboutKnownTestSelectors = function () {
        return "Did you forget to load a plugin? Known test selectors: " + JSON.stringify(test_selector_1.TestSelectorFactory.instance().knownNames()) + ".";
    };
    TestSelectorOrchestrator.prototype.createTestSelector = function (name) {
        return test_selector_1.TestSelectorFactory.instance().create(name, this.createSettings());
    };
    TestSelectorOrchestrator.prototype.testSelectorExists = function (maybeSelector) {
        return test_selector_1.TestSelectorFactory.instance().knownNames().indexOf(maybeSelector) > -1;
    };
    TestSelectorOrchestrator.prototype.createSettings = function () {
        return { options: this.options };
    };
    return TestSelectorOrchestrator;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TestSelectorOrchestrator;
//# sourceMappingURL=TestSelectorOrchestrator.js.map