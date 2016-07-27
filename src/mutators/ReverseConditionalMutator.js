"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var esprima_1 = require('esprima');
var OperatorMutator_1 = require('./OperatorMutator');
var ReverseConditionalMutator = (function (_super) {
    __extends(ReverseConditionalMutator, _super);
    function ReverseConditionalMutator() {
        _super.call(this, 'ReverseConditional', [esprima_1.Syntax.BinaryExpression, esprima_1.Syntax.LogicalExpression], {
            '==': '!=',
            '!=': '==',
            '===': '!==',
            '!==': '===',
            '<=': '>',
            '>=': '<',
            '<': '>=',
            '>': '<=',
            '&&': '||',
            '||': '&&' });
    }
    return ReverseConditionalMutator;
}(OperatorMutator_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ReverseConditionalMutator;
//# sourceMappingURL=ReverseConditionalMutator.js.map