"use strict";
var _ = require('lodash');
var BlockStatementMutator_1 = require('./mutators/BlockStatementMutator');
var ConditionalBoundaryMutator_1 = require('./mutators/ConditionalBoundaryMutator');
var MathMutator_1 = require('./mutators/MathMutator');
var RemoveConditionalsMutator_1 = require('./mutators/RemoveConditionalsMutator');
var ReverseConditionalMutator_1 = require('./mutators/ReverseConditionalMutator');
var UnaryOperatorMutator_1 = require('./mutators/UnaryOperatorMutator');
var mutant_1 = require('stryker-api/mutant');
var fileUtils = require('./utils/fileUtils');
var Mutant_1 = require('./Mutant');
var parserUtils = require('./utils/parserUtils');
var log4js = require('log4js');
var objectUtils_1 = require('./utils/objectUtils');
var babel_core_1 = require('babel-core');
var log = log4js.getLogger('Mutator');
/**
 * Class capable of finding spots to mutate in files.
 */
var MutatorOrchestrator = (function () {
    /**
     * @param reporter - The reporter to report read input files to
     */
    function MutatorOrchestrator(reporter) {
        var _this = this;
        this.reporter = reporter;
        this.mutators = [];
        this.registerDefaultMutators();
        var mutatorFactory = mutant_1.MutatorFactory.instance();
        mutatorFactory.knownNames().forEach(function (name) { return _this.mutators.push(mutatorFactory.create(name, null)); });
    }
    /**
     * Mutates source files. Mutated code is not writen to disk.
     * @function
     * @param sourceFiles - The list of files which should be mutated.
     * @returns {Mutant[]} The generated Mutants.
     */
    MutatorOrchestrator.prototype.generateMutants = function (sourceFiles) {
        var _this = this;
        var mutants = [];
        this.sourceFiles = [];
        sourceFiles.forEach(function (sourceFile) {
            try {
                var fileContent = fileUtils.readFile(sourceFile);
                fileContent = babel_core_1.transform(fileContent, { plugins: ["transform-object-rest-spread", "transform-runtime"] }).code;
                //somehow customise this compiler? ^^
                _this.reportFileRead(sourceFile, fileContent);
                var abstractSyntaxTree = parserUtils.parse(fileContent);
                var nodes = parserUtils.collectFrozenNodes(abstractSyntaxTree);
                var newMutants = _this.findMutants(sourceFile, fileContent, abstractSyntaxTree, nodes);
                mutants = mutants.concat(newMutants);
            }
            catch (err) {
                switch (err.code) {
                    case 'ENOENT':
                        log.info("Skipping file " + err.path + " because it does not exist");
                        break;
                    default:
                        console.log(err);
                        throw err;
                }
            }
        });
        this.reportAllFilesRead();
        return mutants;
    };
    ;
    MutatorOrchestrator.prototype.reportFileRead = function (path, content) {
        var fileToReport = { path: path, content: content };
        objectUtils_1.freezeRecursively(fileToReport);
        this.sourceFiles.push(fileToReport);
        this.reporter.onSourceFileRead(fileToReport);
    };
    MutatorOrchestrator.prototype.reportAllFilesRead = function () {
        objectUtils_1.freezeRecursively(this.sourceFiles);
        this.reporter.onAllSourceFilesRead(this.sourceFiles);
    };
    MutatorOrchestrator.prototype.registerDefaultMutators = function () {
        var mutatorFactory = mutant_1.MutatorFactory.instance();
        mutatorFactory.register('BlockStatement', BlockStatementMutator_1.default);
        mutatorFactory.register('ConditionalBoundary', ConditionalBoundaryMutator_1.default);
        mutatorFactory.register('Math', MathMutator_1.default);
        mutatorFactory.register('RemoveConditionals', RemoveConditionalsMutator_1.default);
        mutatorFactory.register('ReverseConditional', ReverseConditionalMutator_1.default);
        mutatorFactory.register('UnaryOperator', UnaryOperatorMutator_1.default);
    };
    /**
     * Finds all mutants for a given set of nodes.
     * @function
     * @param {String} sourceFile - The name source file.
     * @param {String} originalCode - The original content of the file which has not been mutated.
     * @param {Object} ast - The original abstract syntax tree which is used for reference when generating code.
     * @param {AbstractSyntaxTreeNode[]} nodes - The nodes which could be used by mutations to generate mutants.
     * @returns {Mutant[]} All possible Mutants for the given set of nodes.
     */
    MutatorOrchestrator.prototype.findMutants = function (sourceFile, originalCode, ast, nodes) {
        var _this = this;
        var mutants = [];
        nodes.forEach(function (astnode) {
            if (astnode.type) {
                Object.freeze(astnode);
                _this.mutators.forEach(function (mutator) {
                    try {
                        var mutatedNodes = mutator.applyMutations(astnode, function (node, deepClone) {
                            return deepClone ? _.cloneDeep(node) : _.clone(node);
                        });
                        if (mutatedNodes.length > 0) {
                            log.debug("The mutator '" + mutator.name + "' mutated " + mutatedNodes.length + " node" + (mutatedNodes.length > 1 ? 's' : '') + " between (Ln " + astnode.loc.start.line + ", Col " + astnode.loc.start.column + ") and (Ln " + astnode.loc.end.line + ", Col " + astnode.loc.end.column + ") in file " + sourceFile);
                        }
                        mutatedNodes.forEach(function (mutatedNode) {
                            var mutatedCode = parserUtils.generate(mutatedNode);
                            var originalNode = nodes[mutatedNode.nodeID];
                            mutants.push(new Mutant_1.default(mutator.name, sourceFile, originalCode, mutatedCode, originalNode.loc, originalNode.range));
                        });
                    }
                    catch (error) {
                        throw new Error("The mutator named '" + mutator.name + "' caused an error: " + error);
                    }
                });
            }
        });
        return mutants;
    };
    ;
    return MutatorOrchestrator;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MutatorOrchestrator;
//# sourceMappingURL=MutatorOrchestrator.js.map
