var defaults = require('./default-options');

function Config (options) {
  this.options = Object.assign({}, defaults, options);

  this._auth = {
    username:  this.options.username  || process.env.SAUCE_USERNAME,
    accessKey: this.options.accesskey || process.env.SAUCE_ACCESS_KEY,
    build:     this.options.build,
    tunnelIdentifier: this.options.tunnelIdentifier || 'saucie'
  };

  this._desired = {
    "browserName"      : this.options.browser,
    "tags"             : this.options.tags,
    "name"             : this.options.sessionName,
    "public"           : this.options.visibility,
    "tunnelIdentifier" : this._auth.tunnelIdentifier
  };

  if (this._auth.build) {
    this._desired.build = this._auth.build;
  }

  if (this.options.version) {
    this._desired.version = this.options.version;
  }

  if (this.options.maxDuration) {
    this._desired.maxDuration = this.options.maxDuration;
  }

  if (this.options.deviceName) {
    this._desired.deviceName = this.options.deviceName;
  }

  if (this.options.deviceOrientation) {
    this._desired.deviceOrientation = this.options.deviceOrientation;
  }

  if (this.options.platform.match(/iOS|Android/)) {
    // Appium requires separate strings
    this._desired.platformName = this.options.platform;

    if (this.options.platformVersion) {
      this._desired.platformVersion = this.options.platformVersion;
    }
  } else {
    if (this.options.platform) {
      this._desired.platform = this.options.platform;

      if (this.options.platformVersion) {
        this._desired.platform += ' ' + this.options.platformVersion;
      }
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
    region: this.options.region,
    tunnelDomains: this.options.tunnelDomains,
    logger: console.log
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
