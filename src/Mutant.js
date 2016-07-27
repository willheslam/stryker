"use strict";
var StrykerTempFolder_1 = require('./utils/StrykerTempFolder');
/**
 * Represents a mutation which has been applied to a file.
 */
var Mutant = (function () {
    /**
     * @param mutatorName - The name of the Mutator which created this mutant.
     * @param filename - The name of the file which was mutated, including the path.
     * @param originalCode - The original content of the file which has not been mutated.
     * @param replacement - The mutated code which will replace a part of the originalCode.
     * @param location - The location of the code to be mutated - line and column based
     * @param range - The location of the code to be mutated - index based
     */
    function Mutant(mutatorName, filename, originalCode, replacement, location, range) {
        this.mutatorName = mutatorName;
        this.filename = filename;
        this.originalCode = originalCode;
        this.replacement = replacement;
        this.location = location;
        this.range = range;
        this.scopedTestsById = [];
        this._scopedTestIds = [];
        this.specsRan = [];
        this._timeSpentScopedTests = 0;
    }
    Object.defineProperty(Mutant.prototype, "scopedTestIds", {
        get: function () {
            return this._scopedTestIds;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Mutant.prototype, "timeSpentScopedTests", {
        get: function () {
            return this._timeSpentScopedTests;
        },
        enumerable: true,
        configurable: true
    });
    Mutant.prototype.addRunResultForTest = function (index, runResult) {
        this._scopedTestIds.push(index);
        this._timeSpentScopedTests += runResult.timeSpent;
        this.scopedTestsById[index] = runResult;
    };
    Mutant.prototype.isNewLine = function (index) {
        var char = this.originalCode[index];
        return char === '\n' || char === '\r';
    };
    Mutant.prototype.getMutationLineIndexes = function () {
        var startIndexLines = this.range[0], endIndexLines = this.range[1];
        while (startIndexLines > 0 && !this.isNewLine(startIndexLines - 1)) {
            startIndexLines--;
        }
        while (endIndexLines < this.originalCode.length && !this.isNewLine(endIndexLines)) {
            endIndexLines++;
        }
        return [startIndexLines, endIndexLines];
    };
    Object.defineProperty(Mutant.prototype, "originalLines", {
        get: function () {
            var _a = this.getMutationLineIndexes(), startIndex = _a[0], endIndex = _a[1];
            return this.originalCode.substring(startIndex, endIndex);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Mutant.prototype, "mutatedLines", {
        get: function () {
            var _a = this.getMutationLineIndexes(), startIndex = _a[0], endIndex = _a[1];
            return this.originalCode.substring(startIndex, this.range[0]) + this.replacement + this.originalCode.substring(this.range[1], endIndex);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Mutant.prototype, "mutatedCode", {
        get: function () {
            return this.originalCode.substr(0, this.range[0]) + this.replacement + this.originalCode.substr(this.range[1]);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Saves the mutated code in a mutated file.
     * @function
     */
    Mutant.prototype.save = function (filename) {
        return StrykerTempFolder_1.default.writeFile(filename, this.mutatedCode);
    };
    ;
    /**
     * Removes the mutated file.
     * @function
     */
    Mutant.prototype.reset = function (filename) {
        return StrykerTempFolder_1.default.writeFile(filename, this.originalCode);
    };
    ;
    return Mutant;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Mutant;
//# sourceMappingURL=Mutant.js.map