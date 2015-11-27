var extend = require('extend');

var argv = require('./argv');

function Config (options) {
  this.options = {};

  extend(this.options, argv, options);

  this._auth = {
    username:  this.options.username  || process.env.SAUCE_USERNAME,
    accessKey: this.options.accesskey || process.env.SAUCE_ACCESS_KEY,
    build:     this.options.buildSL,
    tunnelIdentifier: this.options.tunnelIdentifierSL
  };

  this._desired = {
    "browserName": this.options.browserNameSL,
    "version"    : this.options.versionSL,
    "platform"   : this.options.platformSL,
    "deviceName" : this.options.deviceNameSL,
    "device-orientation": this.options.deviceOrientationSL,
    "tags"       : this.options.tagsSL,
    "name"       : this.options.sessionNameSL,
    "public"     : this.options.visibilitySL,
    "build"      : this._auth.build,
    "tunnel-identifier": this._auth.tunnelIdentifier,
    "record-video": true
  };

  this.url = this.options.url;
  this.timeout = this.options.timeout;
  this.connect = this.options.connect;
  this.attach = this.options.attach;

  this._launcherOptions = {
    username: this._auth.username,
    accessKey: this._auth.accessKey,
    tunnelIdentifier: this._auth.tunnelIdentifier,
    vmVersion: this.options.vmVersion,
    tunnelDomains: this.options.tunnelDomains,
    logger: console.log,
    verbose: true
  };
}

Config.prototype.desired = function() {
  return this._desired;
};

Config.prototype.auth = function() {
  return this._auth;
};

Config.prototype.launcherOptions = function() {
  return this._launcherOptions;
};

module.exports = Config;
