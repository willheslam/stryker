"use strict";
var _ = require('lodash');
function freezeRecursively(target) {
    Object.freeze(target);
    Object.keys(target).forEach(function (key) {
        if (_.isObject(target[key])) {
            freezeRecursively(target[key]);
        }
    });
}
exports.freezeRecursively = freezeRecursively;
function isPromise(input) {
    return input && typeof input['then'] === 'function';
}
exports.isPromise = isPromise;
//# sourceMappingURL=objectUtils.js.map