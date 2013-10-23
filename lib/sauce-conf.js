var webdriver   = require('wd'),
    async       = require('async'),
    optimist    = require('optimist'),
    extend      = require('extend'),

    exports     = module.exports = {},
    libraryName = exports.libraryName = "Saucie",
    argv        = optimist
      .usage('A js test running using Sauce Labs. Supports Mocha, Qunit and Jasmine tests')
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
        'default':  'Linux',
        'describe': "Define the platform to run the tests, e.g: 'Linux', 'Windows 7', 'Windows XP', 'OS X 10.6'"
      })
      .options('tunnelIdentifierSL', {
        'alias':    't',
        'default':  process.env.TRAVIS_JOB_NUMBER || libraryName,
        'describe': 'Define a tunnel name'
      })
      .options('buildSL', {
        'alias':    'build',
        'default':  process.env.TRAVIS_BUILD_NUMBER || "dev-tests",
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
      .options('host', {
        'alias':    'ht',
        'default':  'http://localhost',
        'describe': 'Define the host address to access tests through saucelabs'
      })
      .options('port', {
        'alias':    'pt',
        'default':  8080,
        'describe': 'Define the port address to access tests through saucelabs'
      })
      .options('connect', {
        'alias':    'ct',
        'default':  true,
        'boolean':  true,
        'describe': 'Connect to SauceLabs, creating a simple wrapper around the SauceConnect.jar'
      })
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
        "tags"       : argv.tagsSL,
        "name"       : argv.sessionNameSL,
        "public"     : "public",
        "build"      : auth.build,
        "tunnel-identifier": auth.tunnelIdentifier,
        "record-video": true
      };
      launcherOptions = {
        username: auth.username,
        accessKey: auth.accessKey,
        verbose: true,
        logfile: 'sauce-example.log', //optionally change sauce connect logfile location
        tunnelIdentifier: auth.tunnelIdentifier, // optionally identity the tunnel for concurrent tunnels
        logger: console.log,
        no_progress: false // optionally hide progress bar
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
