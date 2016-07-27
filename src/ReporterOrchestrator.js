"use strict";
var report_1 = require('stryker-api/report');
var ClearTextReporter_1 = require('./reporters/ClearTextReporter');
var ProgressReporter_1 = require('./reporters/ProgressReporter');
var EventRecorderReporter_1 = require('./reporters/EventRecorderReporter');
var BroadcastReporter_1 = require('./reporters/BroadcastReporter');
var log4js = require('log4js');
var log = log4js.getLogger('ReporterOrchestrator');
var ReporterOrchestrator = (function () {
    function ReporterOrchestrator(options) {
        this.options = options;
        this.registerDefaultReporters();
    }
    ReporterOrchestrator.prototype.createBroadcastReporter = function () {
        var _this = this;
        var reporters = [];
        var reporterOption = this.options.reporter;
        if (reporterOption) {
            if (Array.isArray(reporterOption)) {
                reporterOption.forEach(function (reporterName) { return reporters.push({ name: reporterName, reporter: report_1.ReporterFactory.instance().create(reporterName, _this.options) }); });
            }
            else {
                reporters.push({ name: reporterOption, reporter: report_1.ReporterFactory.instance().create(reporterOption, this.options) });
            }
        }
        else {
            log.warn("No reporter configured. Please configure one or more reporters in the (for example: reporter: 'progress')");
            this.logPossibleReporters();
        }
        return new BroadcastReporter_1.default(reporters);
    };
    ReporterOrchestrator.prototype.logPossibleReporters = function () {
        var possibleReportersCsv = '';
        report_1.ReporterFactory.instance().knownNames().forEach(function (name) {
            if (possibleReportersCsv.length) {
                possibleReportersCsv += ', ';
            }
            possibleReportersCsv += name;
        });
        log.warn("Possible reporters: " + possibleReportersCsv);
    };
    ReporterOrchestrator.prototype.registerDefaultReporters = function () {
        report_1.ReporterFactory.instance().register('progress', ProgressReporter_1.default);
        report_1.ReporterFactory.instance().register('clear-text', ClearTextReporter_1.default);
        report_1.ReporterFactory.instance().register('event-recorder', EventRecorderReporter_1.default);
    };
    return ReporterOrchestrator;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ReporterOrchestrator;
//# sourceMappingURL=ReporterOrchestrator.js.map