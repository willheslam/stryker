"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var esprima_1 = require('esprima');
var OperatorMutator_1 = require('./OperatorMutator');
var UnaryOperatorMutator = (function (_super) {
    __extends(UnaryOperatorMutator, _super);
    function UnaryOperatorMutator() {
        _super.call(this, 'UnaryOperator', [esprima_1.Syntax.UpdateExpression, esprima_1.Syntax.UnaryExpression], {
            '++': '--',
            '--': '++',
            '-': '+',
            '+': '-' });
    }
    return UnaryOperatorMutator;
}(OperatorMutator_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UnaryOperatorMutator;
//# sourceMappingURL=UnaryOperatorMutator.js.map