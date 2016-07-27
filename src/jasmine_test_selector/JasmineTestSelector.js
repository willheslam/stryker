"use strict";
var test_selector_1 = require('stryker-api/test_selector');
var INTERCEPTOR_CODE = "(function(global){\n    var realIt = global.it, count = 0;\n    var scoped = %IDS_PLACEHOLDER%;\n    global.it = function(){\n        if(scoped && scoped.indexOf(count) >= 0){\n            var spec = realIt.apply(global, arguments);\n        }\n        count ++;\n    }\n})(window || global);";
var JasmineTestSelector = (function () {
    function JasmineTestSelector(settings) {
        this.settings = settings;
    }
    JasmineTestSelector.prototype.select = function (ids) {
        return INTERCEPTOR_CODE.replace('%IDS_PLACEHOLDER%', JSON.stringify(ids));
    };
    return JasmineTestSelector;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = JasmineTestSelector;
test_selector_1.TestSelectorFactory.instance().register('jasmine', JasmineTestSelector);
//# sourceMappingURL=JasmineTestSelector.js.map