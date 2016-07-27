"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var esprima_1 = require('esprima');
var OperatorMutator_1 = require('./OperatorMutator');
var ConditionalBoundayMutator = (function (_super) {
    __extends(ConditionalBoundayMutator, _super);
    function ConditionalBoundayMutator() {
        _super.call(this, 'ConditionalBoundary', [esprima_1.Syntax.BinaryExpression], {
            '<': '<=',
            '<=': '<',
            '>': '>=',
            '>=': '>'
        });
    }
    return ConditionalBoundayMutator;
}(OperatorMutator_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ConditionalBoundayMutator;
//# sourceMappingURL=ConditionalBoundaryMutator.js.map