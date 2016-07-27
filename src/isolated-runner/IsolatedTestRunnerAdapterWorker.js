"use strict";
var Message_1 = require('./Message');
var test_runner_1 = require('stryker-api/test_runner');
var PluginLoader_1 = require('../PluginLoader');
var log4js = require('log4js');
var objectUtils_1 = require('../utils/objectUtils');
var log = log4js.getLogger('TestRunnerChildProcessAdapterWorker');
var TestRunnerChildProcessAdapterWorker = (function () {
    function TestRunnerChildProcessAdapterWorker() {
        this.listenToMessages();
    }
    TestRunnerChildProcessAdapterWorker.prototype.listenToMessages = function () {
        var _this = this;
        process.on('message', function (message) {
            switch (message.type) {
                case Message_1.MessageType.Start:
                    _this.start(message.body);
                    break;
                case Message_1.MessageType.Run:
                    _this.run(message.body);
                    break;
                case Message_1.MessageType.Init:
                    _this.init();
                    break;
                case Message_1.MessageType.Dispose:
                    _this.dispose();
                    break;
                default:
                    log.warn('Received unsupported message: {}', JSON.stringify(message));
            }
        });
    };
    TestRunnerChildProcessAdapterWorker.prototype.start = function (body) {
        this.loadPlugins(body.runnerOptions.strykerOptions.plugins);
        this.underlyingTestRunner = test_runner_1.TestRunnerFactory.instance().create(body.runnerName, body.runnerOptions);
    };
    TestRunnerChildProcessAdapterWorker.prototype.init = function () {
        var initPromise = void 0;
        if (this.underlyingTestRunner.init) {
            initPromise = this.underlyingTestRunner.init();
        }
        if (objectUtils_1.isPromise(initPromise)) {
            initPromise.then(this.sendInitDone);
        }
        else {
            this.sendInitDone();
        }
    };
    TestRunnerChildProcessAdapterWorker.prototype.sendInitDone = function () {
        process.send({ type: Message_1.MessageType.InitDone });
    };
    TestRunnerChildProcessAdapterWorker.prototype.dispose = function () {
        var disposePromise = void 0;
        if (this.underlyingTestRunner.dispose) {
            disposePromise = this.underlyingTestRunner.dispose();
        }
        if (objectUtils_1.isPromise(disposePromise)) {
            disposePromise.then(this.sendDisposeDone);
        }
        else {
            this.sendDisposeDone();
        }
    };
    TestRunnerChildProcessAdapterWorker.prototype.sendDisposeDone = function () {
        process.send({ type: Message_1.MessageType.DisposeDone });
    };
    TestRunnerChildProcessAdapterWorker.prototype.run = function (body) {
        this.underlyingTestRunner.run(body.runOptions).then(this.reportResult, this.reportErrorResult);
    };
    TestRunnerChildProcessAdapterWorker.prototype.loadPlugins = function (plugins) {
        new PluginLoader_1.default(plugins).load();
    };
    TestRunnerChildProcessAdapterWorker.prototype.reportResult = function (result) {
        var message = {
            type: Message_1.MessageType.Result,
            body: { result: result }
        };
        process.send(message);
    };
    TestRunnerChildProcessAdapterWorker.prototype.reportErrorResult = function (error) {
        var message = {
            type: Message_1.MessageType.Result,
            body: {
                result: {
                    testNames: [],
                    result: test_runner_1.TestResult.Error,
                }
            }
        };
        process.send(message);
    };
    return TestRunnerChildProcessAdapterWorker;
}());
new TestRunnerChildProcessAdapterWorker();
//# sourceMappingURL=IsolatedTestRunnerAdapterWorker.js.map