"use strict";
var esprima_1 = require('esprima');
/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
var RemoveConditionalsMutator = (function () {
    function RemoveConditionalsMutator() {
        this.name = 'RemoveConditionals';
        this.types = [esprima_1.Syntax.DoWhileStatement, esprima_1.Syntax.IfStatement, esprima_1.Syntax.ForStatement, esprima_1.Syntax.WhileStatement];
    }
    RemoveConditionalsMutator.prototype.applyMutations = function (node, copy) {
        var nodes = [];
        if (this.canMutate(node)) {
            var mutatedFalseNode = copy(node.test);
            this.mutateTestExpression(mutatedFalseNode, false);
            nodes.push(mutatedFalseNode);
            if (node.type === esprima_1.Syntax.IfStatement) {
                var mutatedTrueNode = copy(node.test);
                this.mutateTestExpression(mutatedTrueNode, true);
                nodes.push(mutatedTrueNode);
            }
        }
        return nodes;
    };
    RemoveConditionalsMutator.prototype.mutateTestExpression = function (node, newValue) {
        node.type = esprima_1.Syntax.Literal;
        node.value = newValue;
    };
    RemoveConditionalsMutator.prototype.canMutate = function (node) {
        return !!(node && this.types.indexOf(node.type) >= 0);
    };
    ;
    RemoveConditionalsMutator.prototype.copyNode = function (node) {
        return JSON.parse(JSON.stringify(node));
    };
    return RemoveConditionalsMutator;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RemoveConditionalsMutator;
//# sourceMappingURL=RemoveConditionalsMutator.js.map