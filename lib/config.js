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
    "browserName"      : this.options.browserNameSL,
    "deviceName"       : this.options.deviceNameSL,
    "deviceOrientation": this.options.deviceOrientationSL,
    "tags"             : this.options.tagsSL,
    "name"             : this.options.sessionNameSL,
    "public"           : this.options.visibilitySL,
    "build"            : this._auth.build,
    "tunnelIdentifier" : this._auth.tunnelIdentifier
  };

  if (this.options.versionSL) {
    this._desired.version = this.options.versionSL;
  }

  if (this.options.platformNameSL.match(/iOS|Android/)) {
    // Appium requires to seperate strings, https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options#TestConfigurationOptions-Appium-SpecificOptions
    this._desired.platformName = this.options.platformNameSL;

    if (this.options.platformVersionSL) {
      this._desired.platformVersion = this.options.platformVersionSL;
    }
  } else {
    // Selenium just one
    this._desired.platform = this.options.platformNameSL || '';

    if (this.options.platformVersionSL) {
      this._desired.platform += ' ' + this.options.platformVersionSL;
    }
  }

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
    verbose: true,
    connectRetries: this.options.connectRetries
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
