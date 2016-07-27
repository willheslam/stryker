"use strict";
var config_1 = require('stryker-api/config');
var log4js = require('log4js');
var _ = require('lodash');
exports.CONFIG_SYNTAX_HELP = '  module.exports = function(config) {\n' +
    '    config.set({\n' +
    '      // your config\n' +
    '    });\n' +
    '  };\n';
var log = log4js.getLogger('ConfigReader');
var ConfigReader = (function () {
    function ConfigReader(options) {
        this.options = options;
    }
    ConfigReader.prototype.readConfig = function () {
        var configModule = this.loadConfigModule();
        var config = new config_1.Config();
        try {
            configModule(config);
        }
        catch (e) {
            log.fatal('Error in config file!\n', e);
            process.exit(1);
        }
        // merge the config from config file and cliOptions (precedence)
        config.set(this.options);
        return config;
    };
    ConfigReader.prototype.loadConfigModule = function () {
        var configModule;
        if (this.options.configFile) {
            log.debug('Loading config %s', this.options.configFile);
            try {
                configModule = require(process.cwd() + "/" + this.options.configFile);
            }
            catch (e) {
                if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(this.options.configFile) !== -1) {
                    log.fatal('File %s does not exist!', this.options.configFile);
                    log.fatal(e);
                }
                else {
                    log.fatal('Invalid config file!\n  ' + e.stack);
                }
                process.exit(1);
            }
            if (!_.isFunction(configModule)) {
                log.fatal('Config file must export a function!\n' + exports.CONFIG_SYNTAX_HELP);
                process.exit(1);
            }
        }
        else {
            log.debug('No config file specified.');
            // if no config file path is passed, we define a dummy config module.
            configModule = function () { };
        }
        return configModule;
    };
    return ConfigReader;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ConfigReader;
//# sourceMappingURL=ConfigReader.js.map