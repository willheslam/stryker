"use strict";
var _ = require('lodash');
var esprima = require('esprima');
var escodegen = require('escodegen');
/**
 * Utility class for parsing and generating code.
 * @constructor
 */
var esprimaOptions = {
    comment: true,
    loc: true,
    range: true,
    tokens: true,
};
/**
 * Parses code to generate an Abstract Syntax Tree.
 * @function
 * @param code - The code which has to be parsed.
 * @returns {Object} The generated Abstract Syntax Tree.
 */
function parse(code) {
    if (code === undefined) {
        throw new Error('Code parameter cannot be undefined');
    }
    if (code === '') {
        return {};
    }
    var abstractSyntaxTree = esprima.parse(code, esprimaOptions);
    return abstractSyntaxTree;
}
exports.parse = parse;
;
/**
 * Finds all nodes which have a 'type' property and freezes them.
 * @function
 * @param abstractSyntaxTree - The current part of the abstract syntax tree which will be investigated.
 * @returns  All nodes with a type.
 */
function collectFrozenNodes(abstractSyntaxTree, nodes) {
    nodes = nodes || [];
    if (!_.isArray(abstractSyntaxTree) && _.isObject(abstractSyntaxTree) && abstractSyntaxTree.type && _.isUndefined(abstractSyntaxTree.nodeID)) {
        abstractSyntaxTree.nodeID = nodes.length;
        nodes.push(abstractSyntaxTree);
    }
    Object.freeze(abstractSyntaxTree);
    _.forOwn(abstractSyntaxTree, function (childNode, i) {
        if (childNode instanceof Object && !(childNode instanceof Array)) {
            collectFrozenNodes(childNode, nodes);
        }
        else if (childNode instanceof Array) {
            _.forEach(childNode, function (arrayChild) {
                if (arrayChild instanceof Object && !(arrayChild instanceof Array)) {
                    collectFrozenNodes(arrayChild, nodes);
                }
            });
        }
    });
    return nodes;
}
exports.collectFrozenNodes = collectFrozenNodes;
;
/**
   * Parses a Node to generate code.
   * @param The Node which has to be transformed into code.
   * @returns The generated code.
   */
function generate(node) {
    return escodegen.generate(node);
}
exports.generate = generate;
;
//# sourceMappingURL=parserUtils.js.map