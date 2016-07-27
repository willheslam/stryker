"use strict";
var report_1 = require('stryker-api/report');
var chalk = require('chalk');
var _ = require('lodash');
var log4js = require('log4js');
var log = log4js.getLogger('ClearTextReporter');
var ClearTextReporter = (function () {
    function ClearTextReporter() {
        this.out = process.stdout;
    }
    ClearTextReporter.prototype.writeLine = function (output) {
        this.out.write((output || '') + "\n");
    };
    ClearTextReporter.prototype.onAllMutantsTested = function (mutantResults) {
        var _this = this;
        this.writeLine();
        var mutantsKilled = 0;
        var mutantsTimedOut = 0;
        var mutantsUntested = 0;
        // use these fn's in order to preserve the 'this` pointer
        var logDebugFn = function (input) { return log.debug(input); };
        var writeLineFn = function (input) { return _this.writeLine(input); };
        mutantResults.forEach(function (result) {
            switch (result.status) {
                case report_1.MutantStatus.KILLED:
                    mutantsKilled++;
                    log.debug(chalk.bold.green('Mutant killed!'));
                    _this.logMutantResult(result, logDebugFn);
                    break;
                case report_1.MutantStatus.TIMEDOUT:
                    mutantsTimedOut++;
                    log.debug(chalk.bold.yellow('Mutant timed out!'));
                    _this.logMutantResult(result, logDebugFn);
                    break;
                case report_1.MutantStatus.SURVIVED:
                    _this.writeLine(chalk.bold.red('Mutant survived!'));
                    _this.logMutantResult(result, writeLineFn);
                    break;
                case report_1.MutantStatus.UNTESTED:
                    mutantsUntested++;
                    log.debug(chalk.bold.yellow('Mutant untested!'));
                    _this.logMutantResult(result, logDebugFn);
                    break;
            }
        });
        var mutationScoreCodebase = (((mutantsKilled + mutantsTimedOut) / mutantResults.length) * 100).toFixed(2);
        var mutationScoreCodeCoverage = (((mutantsKilled + mutantsTimedOut) / ((mutantResults.length - mutantsUntested) || 1)) * 100).toFixed(2);
        var codebaseColor = this.getColorForMutationScore(+mutationScoreCodebase);
        var codecoverageColor = this.getColorForMutationScore(+mutationScoreCodeCoverage);
        this.writeLine((mutantResults.length - mutantsUntested) + ' mutants tested.');
        this.writeLine(mutantsUntested + ' mutants untested.');
        this.writeLine(mutantsTimedOut + ' mutants timed out.');
        this.writeLine(mutantsKilled + ' mutants killed.');
        this.writeLine('Mutation score based on covered code: ' + codecoverageColor(mutationScoreCodeCoverage + '%'));
        this.writeLine('Mutation score based on all code: ' + codebaseColor(mutationScoreCodebase + '%'));
    };
    ClearTextReporter.prototype.logMutantResult = function (result, logImplementation) {
        logImplementation(result.sourceFilePath + ': line ' + result.location.start.line + ':' + result.location.start.column);
        logImplementation('Mutator: ' + result.mutatorName);
        result.originalLines.split('\n').forEach(function (line) {
            logImplementation(chalk.red('-   ' + line));
        });
        result.mutatedLines.split('\n').forEach(function (line) {
            logImplementation(chalk.green('+   ' + line));
        });
        logImplementation('');
        if (result.testsRan && result.testsRan.length > 0) {
            logImplementation('Tests ran: ');
            _.forEach(result.testsRan, function (spec) {
                logImplementation('    ' + spec);
            });
            logImplementation('');
        }
    };
    /**
     * Gets the color associated with a mutation score.
     * @function
     * @param score - The mutation score.
     * @returns {Function} The function which can give the mutation score the right color.
     */
    ClearTextReporter.prototype.getColorForMutationScore = function (score) {
        var color;
        if (score > 80) {
            color = chalk.green;
        }
        else if (score > 50) {
            color = chalk.yellow;
        }
        else {
            color = chalk.red;
        }
        return color;
    };
    return ClearTextReporter;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ClearTextReporter;
//# sourceMappingURL=ClearTextReporter.js.map