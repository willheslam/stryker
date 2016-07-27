"use strict";
var IsolatedTestRunnerAdapter_1 = require('./IsolatedTestRunnerAdapter');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    create: function (settings) {
        return new IsolatedTestRunnerAdapter_1.default(settings.strykerOptions.testRunner, settings);
    }
};
//# sourceMappingURL=IsolatedTestRunnerAdapterFactory.js.map