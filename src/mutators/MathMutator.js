"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var esprima_1 = require('esprima');
var OperatorMutator_1 = require('./OperatorMutator');
var MathMutator = (function (_super) {
    __extends(MathMutator, _super);
    function MathMutator() {
        _super.call(this, 'Math', [esprima_1.Syntax.BinaryExpression], {
            '+': '-',
            '-': '+',
            '*': '/',
            '/': '*',
            '%': '*' });
    }
    return MathMutator;
}(OperatorMutator_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MathMutator;
//# sourceMappingURL=MathMutator.js.map