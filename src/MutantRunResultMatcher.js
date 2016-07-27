"use strict";
var MutantRunResultMatcher = (function () {
    function MutantRunResultMatcher(mutants, runResultsByTestId) {
        this.mutants = mutants;
        this.runResultsByTestId = runResultsByTestId;
    }
    MutantRunResultMatcher.prototype.matchWithMutants = function () {
        var _this = this;
        this.mutants.forEach(function (mutant) {
            var smallestStatement;
            _this.runResultsByTestId.forEach(function (testResult, id) {
                var covered = false;
                if (testResult.coverage) {
                    var coveredFile = testResult.coverage[mutant.filename];
                    if (coveredFile) {
                        // Statement map should change between test run results.
                        // We should be able to safely reuse the smallest statement found in first run.
                        if (!smallestStatement) {
                            smallestStatement = _this.findSmallestCoveringStatement(mutant, coveredFile);
                        }
                        covered = coveredFile.s[smallestStatement] > 0;
                    }
                }
                else {
                    // If there is no coverage result we have to assume the source code is covered
                    covered = true;
                }
                if (covered) {
                    mutant.addRunResultForTest(id, testResult);
                }
            });
        });
    };
    /**
     * Finds the smallest statement that covers a mutant.
     * @param mutant The mutant.
     * @param coveredFile The CoverageResult.
     * @returns The index of the coveredFile which contains the smallest statement surrounding the mutant.
     */
    MutantRunResultMatcher.prototype.findSmallestCoveringStatement = function (mutant, coveredFile) {
        var _this = this;
        var smallestStatement;
        Object.keys(coveredFile.statementMap).forEach(function (statementId) {
            var location = coveredFile.statementMap[statementId];
            if (_this.statementCoversMutant(mutant, location) && _this.isNewSmallestStatement(coveredFile.statementMap[smallestStatement], location)) {
                smallestStatement = statementId;
            }
        });
        return smallestStatement;
    };
    /**
     * Indicates whether a statement is the smallest statement of the two statements provided.
     * @param originalLocation The area which may cover a bigger area than the newLocation.
     * @param newLocation The area which may cover a smaller area than the originalLocation.
     * @returns true if the newLocation covers a smaller area than the originalLocation, making it the smaller statement.
     */
    MutantRunResultMatcher.prototype.isNewSmallestStatement = function (originalLocation, newLocation) {
        var statementIsSmallestStatement = false;
        if (!originalLocation) {
            statementIsSmallestStatement = true;
        }
        else {
            var lineDifference = (originalLocation.end.line - originalLocation.start.line) - (newLocation.end.line - newLocation.start.line);
            var coversLessLines = lineDifference > 0;
            var coversLessColumns = lineDifference === 0 && (newLocation.start.column - originalLocation.start.column) + (originalLocation.end.column - newLocation.end.column) > 0;
            if (coversLessLines || coversLessColumns) {
                statementIsSmallestStatement = true;
            }
        }
        return statementIsSmallestStatement;
    };
    /**
     * Indicates whether a statement covers a mutant.
     * @param mutant The mutant.
     * @param location The location which may cover the mutant.
     * @returns true if the statment covers the mutant.
     */
    MutantRunResultMatcher.prototype.statementCoversMutant = function (mutant, location) {
        var mutantIsAfterStart = mutant.location.end.line > location.start.line ||
            (mutant.location.end.line === location.start.line && mutant.location.end.column >= location.start.column);
        var mutantIsBeforeEnd = mutant.location.start.line < location.end.line ||
            (mutant.location.start.line === location.end.line && mutant.location.start.column <= location.end.column);
        return mutantIsAfterStart && mutantIsBeforeEnd;
    };
    return MutantRunResultMatcher;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MutantRunResultMatcher;
//# sourceMappingURL=MutantRunResultMatcher.js.map