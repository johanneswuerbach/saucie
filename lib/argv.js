var optimist = require('optimist');
var libraryName = "Saucie";

module.exports = optimist
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
    'describe': 'Define the browser version',
    'string': true
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
  .options('vmVersion', {
      'describe': 'Choose dev-varnish to enable websocket support'
  })
  .options('tunnelDomains', {
      'describe': 'A comma separated list of domains to send through the tunnel'
  })
  .string('versionSL')
  .argv;
