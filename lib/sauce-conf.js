var webdriver   = require('wd'),
    async       = require('async'),
    optimist    = require('optimist'),
    extend      = require('extend'),

    exports     = module.exports = {},
    libraryName = exports.libraryName = "Saucie",
    argv        = optimist
      .usage('A js test runner using Sauce Labs. Supports Mocha, Qunit and Jasmine tests. Please make sure you have a file named testem.yml in the folder.')
      .options('username', {
        'alias':    'u',
        'describe': 'Define the SauceLabs user name. Or it can be set as a `SAUCE_USERNAME` environment variable.'
      })
      .options('accesskey', {
        'alias':    'k',
        'describe': 'Define the SauceLabs access key. Or it can be set as a `SAUCE_ACCESS_KEY` environment variable.'
      })
      .options('help', {
        'alias':    'h',
        'describe': 'Display the usage'
      })
      .options('browserNameSL', {
        'alias':    'b',
        'default':  'chrome',
        'describe': "Define the browser, e.g.: 'internet explorer', 'firefox', 'chrome'"
      })
      .options('versionSL', {
        'alias':    'v',
        'default':  '',
        'describe': 'Define the browser version'
      })
      .options('platformSL', {
        'alias':    'p',
        'default':  '',
        'describe': "Define the platform to run the tests, e.g: 'Linux', 'Windows 7', 'Windows XP', 'OS X 10.6'"
      })
      .options('deviceNameSL', {
        'alias':    'dn',
        'default':  '',
        'describe': "Define which device name to use. It's used only for mobile platform, e.g: 'iPhone Simulator', 'Motorola Atrix HD Emulator', 'LG Optimus 3D Emulator', 'Google Nexus 7C Emulator'"
      })
      .options('deviceOrientationSL', {
        'alias':    'do',
        'default':  '',
        'describe': "Define the device orientation. It's used only for mobile platform, e.g: 'portrait', 'landscape'"
      })
      .options('tunnelIdentifierSL', {
        'alias':    't',
        'default':  process.env.TRAVIS_JOB_NUMBER,
        'describe': 'Define a tunnel name'
      })
      .options('buildSL', {
        'alias':    'build',
        'default':  process.env.TRAVIS_BUILD_NUMBER,
        'describe': 'Define the build name/number'
      })
      .options('tagsSL', {
        'alias':    'tg',
        'default':  [libraryName, "test"],
        'describe': 'Define tag names'
      })
      .options('sessionNameSL', {
        'alias':    'n',
        'default':  libraryName + " tests",
        'describe': 'Define the session name on SauceLabs'
      })
      .options('url', {
          'alias':    'u',
          'default':  'http://localhost:8080',
          'describe': 'Define the url to access tests through saucelabs'
      })
      .options('visibilitySL', {
        'alias':    'vi',
        'default':  "public",
        'describe': 'Visibilty of the session on saucelabs'
      })      
      .options('connect', {
        'alias':    'ct',
        'default':  true,
        'boolean':  true,
        'describe': 'Connect to SauceLabs, creating a simple wrapper around the SauceConnect.jar'
      })
      .options('attach', {
          'alias':    'at',
          'default':  false,
          'boolean':  true,
          'describe': 'Attach to the launched browser'
      })
      .options('timeout', {
          'describe': 'Timeout in seconds until tests need to finish'
      })
      .string('versionSL')
      .argv,

    browser = undefined,
    auth    = undefined,
    desired = undefined,
    launcherOptions = undefined,


    setConfiguration = function(options) {
      browser && browser.quit();
      extend(argv, options);

      auth = {
        username:  argv.username  || process.env.SAUCE_USERNAME,
        accessKey: argv.accesskey || process.env.SAUCE_ACCESS_KEY,
        build:     argv.buildSL,
        tunnelIdentifier: argv.tunnelIdentifierSL
      };

      browser = webdriver.remote("ondemand.saucelabs.com", 80, auth.username, auth.accessKey);
      desired = {
        "browserName": argv.browserNameSL,
        "version"    : argv.versionSL,
        "platform"   : argv.platformSL,
        "deviceName" : argv.deviceNameSL,
        "device-orientation": argv.deviceOrientationSL,
        "tags"       : argv.tagsSL,
        "name"       : argv.sessionNameSL,
        "public"     : argv.visibiltySL,
        "build"      : auth.build,
        "tunnel-identifier": auth.tunnelIdentifier,
        "record-video": true
      };
      launcherOptions = {
        username: auth.username,
        accessKey: auth.accessKey,
        tunnelIdentifier: auth.tunnelIdentifier,
        logger: console.log,
        verbose: true
      };

      browser.on("status", function(info) {
        //console.log("\x1b[36m%s\x1b[0m", info);
      });

      browser.on("command", function(meth, path, data) {
        //console.log(" > \x1b[33m%s\x1b[0m: %s", meth, path, data || "");
      });

      /**
      Vows Errored » callback not fired
      http://birkett.no/blog/2013/05/01/vows-errored-callback-not-fired/
      */
      process.on('uncaughtException', function(err) {
        browser.quit();
        console.error('Caught exception: ' + err.stack );
      });


      return argv;
    };

extend(exports, {
  browser: function() {
    return browser;
  },
  desired: function() {
    return desired;
  },
  auth: function() {
    return auth;
  },
  launcherOptions: function() {
    return launcherOptions;
  },
  argv: function() {
    return argv;
  },
  set: setConfiguration
});


if (argv.help) {
  optimist.showHelp();
  process.exit(0);
}
