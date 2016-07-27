"use strict";
var fs = require('fs');
var path = require('path');
var log4js = require('log4js');
var _ = require('lodash');
var fileUtils_1 = require('./utils/fileUtils');
var log = log4js.getLogger('PluginLoader');
var IGNORED_PACKAGES = ['stryker-cli', 'stryker-api'];
var PluginLoader = (function () {
    function PluginLoader(plugins) {
        this.plugins = plugins;
    }
    PluginLoader.prototype.load = function () {
        this.getModules().forEach(this.requirePlugin);
    };
    PluginLoader.prototype.getModules = function () {
        var modules = [];
        this.plugins.forEach(function (pluginExpression) {
            if (_.isString(pluginExpression)) {
                if (pluginExpression.indexOf('*') !== -1) {
                    // Plugin directory is the node_modules folder of the module that installed stryker
                    // So if current __dirname is './stryker/src' than the plugin directory should be 2 directories above
                    var pluginDirectory = path.normalize(__dirname + '/../..');
                    var regexp = new RegExp('^' + pluginExpression.replace('*', '.*'));
                    log.debug('Loading %s from %s', pluginExpression, pluginDirectory);
                    var plugins = fs.readdirSync(pluginDirectory)
                        .filter(function (pluginName) { return IGNORED_PACKAGES.indexOf(pluginName) === -1 && regexp.test(pluginName); })
                        .map(function (pluginName) { return pluginDirectory + '/' + pluginName; });
                    if (plugins.length === 0) {
                        log.debug('Expression %s not resulted in plugins to load', pluginExpression);
                    }
                    plugins
                        .map(function (plugin) { return path.basename(plugin); })
                        .map(function (plugin) {
                        log.debug('Loading plugins %s (matched with expression %s)', plugin, pluginExpression);
                        return plugin;
                    })
                        .forEach(function (p) { return modules.push(p); });
                }
                else {
                    modules.push(pluginExpression);
                }
            }
            else {
                log.warn('Ignoring plugin %s, as its not a string type', pluginExpression);
            }
        });
        return modules;
    };
    PluginLoader.prototype.requirePlugin = function (name) {
        log.debug("Loading plugins " + name);
        try {
            fileUtils_1.importModule(name);
        }
        catch (e) {
            if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(name) !== -1) {
                log.warn('Cannot find plugin "%s".\n  Did you forget to install it ?\n' +
                    '  npm install %s --save-dev', name, name);
            }
            else {
                log.warn('Error during loading "%s" plugin:\n  %s', name, e.message);
            }
        }
    };
    return PluginLoader;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PluginLoader;
//# sourceMappingURL=PluginLoader.js.map