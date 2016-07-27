"use strict";
var report_1 = require('stryker-api/report');
var chalk = require('chalk');
var ProgressReporter = (function () {
    function ProgressReporter() {
    }
    ProgressReporter.prototype.onMutantTested = function (result) {
        var toLog;
        switch (result.status) {
            case report_1.MutantStatus.KILLED:
                toLog = '.';
                break;
            case report_1.MutantStatus.TIMEDOUT:
                toLog = chalk.yellow('T');
                break;
            case report_1.MutantStatus.SURVIVED:
                toLog = chalk.bold.red('S');
                break;
            default:
                toLog = '';
                break;
        }
        process.stdout.write(toLog);
    };
    return ProgressReporter;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProgressReporter;
//# sourceMappingURL=ProgressReporter.js.map