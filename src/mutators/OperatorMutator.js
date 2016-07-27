"use strict";
var OperatorMutator = (function () {
    /**
     * Represents a base class for all operator based mutations.
     * @param name The name of the mutator.
     * @param types The type of operators which should be mutated.
     * @param operators The object containing a map for targeted operators and their mutated values.
     */
    function OperatorMutator(name, types, operators) {
        this.name = name;
        this.types = types;
        this.operators = operators;
    }
    OperatorMutator.prototype.applyMutations = function (node, copy) {
        var nodes = [];
        if (this.canMutate(node)) {
            var mutatedNode = copy(node);
            mutatedNode.operator = this.getOperator(node.operator);
            nodes.push(mutatedNode);
        }
        return nodes;
    };
    OperatorMutator.prototype.canMutate = function (node) {
        return !!(node && this.types.indexOf(node.type) >= 0 && this.getOperator(node.operator));
    };
    /**
     * Gets the mutated operator based on an unmutated operator.
     * @function
     * @param {String} operator - An umutated operator.
     * @returns {String} The mutated operator.
     */
    OperatorMutator.prototype.getOperator = function (operator) {
        return this.operators[operator];
    };
    return OperatorMutator;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OperatorMutator;
//# sourceMappingURL=OperatorMutator.js.map