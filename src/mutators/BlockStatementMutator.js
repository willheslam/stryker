"use strict";
var esprima_1 = require('esprima');
/**
 * Represents a mutator which can remove the content of a BlockStatement.
 */
var BlockStatementMutator = (function () {
    function BlockStatementMutator() {
        this.name = 'BlockStatement';
        this.types = [esprima_1.Syntax.BlockStatement];
    }
    BlockStatementMutator.prototype.applyMutations = function (node, copy) {
        var nodes = [];
        if (this.canMutate(node)) {
            var mutatedNode = copy(node);
            mutatedNode.body = [];
            nodes.push(mutatedNode);
        }
        return nodes;
    };
    BlockStatementMutator.prototype.canMutate = function (node) {
        return !!(node && this.types.indexOf(node.type) >= 0);
    };
    ;
    return BlockStatementMutator;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BlockStatementMutator;
//# sourceMappingURL=BlockStatementMutator.js.map