"use strict";
var test_runner_1 = require('stryker-api/test_runner');
var child_process_1 = require('child_process');
var Message_1 = require('./Message');
var _ = require('lodash');
var log4js = require('log4js');
var log = log4js.getLogger('IsolatedTestRunnerAdapter');
var MAX_WAIT_FOR_DISPOSE = 2000;
/**
 * Runs the given test runner in a child process and forwards reports about test results
 * Also implements timeout-mechanisme (on timeout, restart the child runner and report timeout)
 */
var TestRunnerChildProcessAdapter = (function () {
    function TestRunnerChildProcessAdapter(realTestRunnerName, options) {
        this.realTestRunnerName = realTestRunnerName;
        this.options = options;
        this.startWorker();
    }
    TestRunnerChildProcessAdapter.prototype.startWorker = function () {
        // Remove --debug-brk from process arguments. 
        // When debugging, it will try to reuse the same debug port, which will be taken by the main process.
        var execArgv = _.clone(process.execArgv);
        _.remove(execArgv, function (arg) { return arg.substr(0, 11) === '--debug-brk'; });
        this.workerProcess = child_process_1.fork(__dirname + "/IsolatedTestRunnerAdapterWorker", [], { silent: true, execArgv: execArgv });
        this.sendStartCommand();
        this.listenToWorkerProcess();
    };
    TestRunnerChildProcessAdapter.prototype.listenToWorkerProcess = function () {
        var _this = this;
        if (this.workerProcess.stdout) {
            var traceEnabled_1 = log.isTraceEnabled();
            this.workerProcess.stdout.on('data', function (data) {
                if (traceEnabled_1) {
                    log.trace(data.toString());
                }
            });
        }
        if (this.workerProcess.stderr) {
            this.workerProcess.stderr.on('data', function (data) {
                log.error(data.toString());
            });
        }
        this.workerProcess.on('message', function (message) {
            _this.clearCurrentTimer();
            switch (message.type) {
                case Message_1.MessageType.Result:
                    if (!_this.isDisposing) {
                        _this.handleResultMessage(message);
                    }
                    break;
                case Message_1.MessageType.InitDone:
                    _this.initPromiseFulfillmentCallback();
                    break;
                case Message_1.MessageType.DisposeDone:
                    _this.disposePromiseFulfillmentCallback();
                    break;
                default:
                    log.error("Retrieved unrecognized message from child process: " + JSON.stringify(message));
                    break;
            }
        });
    };
    TestRunnerChildProcessAdapter.prototype.init = function () {
        var _this = this;
        this.initPromise = new Promise(function (resolve) { return _this.initPromiseFulfillmentCallback = resolve; });
        this.sendInitCommand();
        return this.initPromise;
    };
    TestRunnerChildProcessAdapter.prototype.run = function (options) {
        var _this = this;
        this.clearCurrentTimer();
        if (options.timeout) {
            this.markNoResultTimeout(options.timeout);
        }
        this.runPromise = new Promise(function (resolve) {
            _this.runPromiseFulfillmentCallback = resolve;
            _this.sendRunCommand(options);
            _this.currentRunStartedTimestamp = new Date();
        });
        return this.runPromise;
    };
    TestRunnerChildProcessAdapter.prototype.dispose = function () {
        var _this = this;
        if (this.isDisposing) {
            return this.disposingPromise;
        }
        else {
            this.isDisposing = true;
            this.disposingPromise = new Promise(function (resolve) { return _this.disposePromiseFulfillmentCallback = resolve; })
                .then(function () {
                clearTimeout(timer_1);
                _this.workerProcess.kill();
                _this.isDisposing = false;
            });
            this.clearCurrentTimer();
            this.sendDisposeCommand();
            var timer_1 = setTimeout(this.disposePromiseFulfillmentCallback, MAX_WAIT_FOR_DISPOSE);
            return this.disposingPromise;
        }
    };
    TestRunnerChildProcessAdapter.prototype.sendRunCommand = function (options) {
        var message = {
            type: Message_1.MessageType.Run,
            body: {
                runOptions: options
            }
        };
        this.workerProcess.send(message);
    };
    TestRunnerChildProcessAdapter.prototype.sendStartCommand = function () {
        var startMessage = {
            type: Message_1.MessageType.Start,
            body: {
                runnerName: this.realTestRunnerName,
                runnerOptions: this.options
            }
        };
        this.workerProcess.send(startMessage);
    };
    TestRunnerChildProcessAdapter.prototype.sendInitCommand = function () {
        this.workerProcess.send(this.emptyMessage(Message_1.MessageType.Init));
    };
    TestRunnerChildProcessAdapter.prototype.sendDisposeCommand = function () {
        this.workerProcess.send(this.emptyMessage(Message_1.MessageType.Dispose));
    };
    TestRunnerChildProcessAdapter.prototype.handleResultMessage = function (message) {
        message.body.result.timeSpent = (new Date().getTime() - this.currentRunStartedTimestamp.getTime());
        this.runPromiseFulfillmentCallback(message.body.result);
    };
    TestRunnerChildProcessAdapter.prototype.clearCurrentTimer = function () {
        if (this.currentTimeoutTimer) {
            clearTimeout(this.currentTimeoutTimer);
        }
    };
    TestRunnerChildProcessAdapter.prototype.markNoResultTimeout = function (timeoutMs) {
        var _this = this;
        this.currentTimeoutTimer = setTimeout(function () {
            _this.handleTimeout();
        }, timeoutMs);
    };
    TestRunnerChildProcessAdapter.prototype.handleTimeout = function () {
        var _this = this;
        this.dispose()
            .then(function () { return _this.startWorker(); })
            .then(function () { return _this.init(); })
            .then(function () { return _this.runPromiseFulfillmentCallback({ result: test_runner_1.TestResult.Timeout }); });
    };
    TestRunnerChildProcessAdapter.prototype.emptyMessage = function (type) {
        return { type: type };
    };
    return TestRunnerChildProcessAdapter;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TestRunnerChildProcessAdapter;
//# sourceMappingURL=IsolatedTestRunnerAdapter.js.map