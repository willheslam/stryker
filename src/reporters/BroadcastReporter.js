"use strict";
var log4js = require('log4js');
var objectUtils_1 = require('../utils/objectUtils');
var log = log4js.getLogger('BroadcastReporter');
exports.ALL_EVENT_METHOD_NAMES = ['onSourceFileRead', 'onAllSourceFilesRead', 'onMutantTested', 'onAllMutantsTested', 'onConfigRead'];
var BroadcastReporter = (function () {
    function BroadcastReporter(reporters) {
        var _this = this;
        this.reporters = reporters;
        exports.ALL_EVENT_METHOD_NAMES.concat('wrapUp').forEach(function (method) {
            _this[method] = function (arg) {
                return _this.broadcast(method, arg);
            };
        });
    }
    BroadcastReporter.prototype.broadcast = function (methodName, eventArgs) {
        var _this = this;
        var allPromises = [];
        this.reporters.forEach(function (namedReporter) {
            var reporter = namedReporter.reporter;
            if (reporter[methodName] && typeof reporter[methodName] === 'function') {
                try {
                    var maybePromise = reporter[methodName](eventArgs);
                    if (objectUtils_1.isPromise(maybePromise)) {
                        allPromises.push(maybePromise.catch(function (error) {
                            _this.handleError(error, methodName, namedReporter.name);
                        }));
                    }
                }
                catch (error) {
                    _this.handleError(error, methodName, namedReporter.name);
                }
            }
        });
        if (allPromises.length) {
            return Promise.all(allPromises);
        }
    };
    BroadcastReporter.prototype.handleError = function (error, methodName, reporterName) {
        log.error("An error occurred during '" + methodName + "' on reporter '" + reporterName + "'. Error is: " + error);
    };
    return BroadcastReporter;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BroadcastReporter;
//# sourceMappingURL=BroadcastReporter.js.map