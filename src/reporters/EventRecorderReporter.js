"use strict";
var BroadcastReporter_1 = require('./BroadcastReporter');
var fileUtils = require('../utils/fileUtils');
var log4js = require('log4js');
var path = require('path');
var log = log4js.getLogger('EventRecorderReporter');
var DEFAULT_BASE_FOLDER = 'reports/mutation/events';
var EventRecorderReporter = (function () {
    function EventRecorderReporter(options) {
        var _this = this;
        this.options = options;
        this.allWork = [];
        var index = 0;
        this.createBaseFolderTask = fileUtils.cleanFolder(this.baseFolder);
        BroadcastReporter_1.ALL_EVENT_METHOD_NAMES.forEach(function (method) {
            _this[method] = function (data) {
                _this.allWork.push(_this.createBaseFolderTask.then(function () { return _this.writeToFile(index++, method, data); }));
            };
        });
    }
    Object.defineProperty(EventRecorderReporter.prototype, "baseFolder", {
        get: function () {
            if (!this._baseFolder) {
                if (this.options['eventReporter'] && this.options['eventReporter']['baseDir']) {
                    this._baseFolder = this.options['eventReporter']['baseDir'];
                    log.debug("Using configured output folder " + this._baseFolder);
                }
                else {
                    log.debug("No base folder configuration found (using configuration: eventReporter: { baseDir: 'output/folder' }), using default " + DEFAULT_BASE_FOLDER);
                    this._baseFolder = DEFAULT_BASE_FOLDER;
                }
            }
            return this._baseFolder;
        },
        enumerable: true,
        configurable: true
    });
    EventRecorderReporter.prototype.writeToFile = function (index, methodName, data) {
        var filename = path.join(this.baseFolder, this.format(index) + "-" + methodName + ".json");
        log.debug("Writing event " + methodName + " to file " + filename);
        return fileUtils.writeFile(filename, JSON.stringify(data));
    };
    EventRecorderReporter.prototype.format = function (input) {
        var str = input.toString();
        for (var i = 10000; i > 1; i = i / 10) {
            if (i > input) {
                str = '0' + str;
            }
        }
        return str;
    };
    EventRecorderReporter.prototype.wrapUp = function () {
        var _this = this;
        return this.createBaseFolderTask.then(function () { return Promise.all(_this.allWork); });
    };
    return EventRecorderReporter;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EventRecorderReporter;
//# sourceMappingURL=EventRecorderReporter.js.map