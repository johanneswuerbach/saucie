var webdriver   = require('wd'),
    async       = require('async'),
    optimist    = require('optimist'),

    exports     = module.exports = {},
    libraryName = exports.libraryName = "Testem",
    argv        = exports.argv = optimist
      .usage('A js test running using Sauce Labs. Supports Mocha, Qunit and Jasmine tests')
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
      .argv,

    auth        = exports.auth = {
      username:  process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY,
      build:     argv.buildSL,
      tunnelIdentifier: argv.tunnelIdentifierSL
    },

    host = "ondemand.saucelabs.com",
    port = 80,
    browser = exports.browser = webdriver.remote(host, port, auth.username, auth.accessKey),

    desired = exports.desired = {
      "browserName": argv.browserNameSL,
      "version"    : argv.versionSL,
      "platform"   : argv.platformSL,
      "tags"       : argv.tagsSL,
      "name"       : argv.sessionNameSL,
      "public"     : "public",
      "build"      : auth.build,
      "tunnel-identifier": auth.tunnelIdentifier,
      "record-video": true
    },

    launcherOptions = exports.launcherOptions = {
      username: auth.username,
      accessKey: auth.accessKey,
      verbose: true,
      logfile: 'sauce-example.log', //optionally change sauce connect logfile location
      tunnelIdentifier: auth.tunnelIdentifier, // optionally identity the tunnel for concurrent tunnels
      logger: console.log,
      no_progress: false // optionally hide progress bar
    };

if (argv.help) {
  optimist.showHelp();
  process.exit(0);
}

browser.on("status", function(info) {
  //console.log("\x1b[36m%s\x1b[0m", info);
});

browser.on("command", function(meth, path, data) {
  //console.log(" > \x1b[33m%s\x1b[0m: %s", meth, path, data || "");
});

process.on('uncaughtException', function(err) {
  browser.quit();
  console.error('Caught exception: ' + err.stack );
});
