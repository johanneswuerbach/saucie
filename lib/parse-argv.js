var optimist = require('optimist');

var defaults = require('./default-options');

module.exports = function(argv) {
  return optimist
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
      'default':  defaults.browserNameSL,
      'describe': "Define the browser, e.g.: 'internet explorer', 'firefox', 'chrome'"
    })
    .options('versionSL', {
      'alias':    'v',
      'default':  defaults.versionSL,
      'describe': 'Define the browser version',
      'string': true
    })
    .options('platformNameSL', {
      'alias':    'p',
      'default':  defaults.platformNameSL,
      'describe': "Define the platform to run the tests, e.g: 'Linux', 'Windows', 'iOS'"
    })
    .options('platformVersionSL', {
      'alias':    'pv',
      'default':  defaults.platformVersionSL,
      'describe': "Define the platform version to run the tests, e.g: 'XP', '9.3'",
      'string': true
    })
    .options('deviceNameSL', {
      'alias':    'dn',
      'default':  defaults.deviceNameSL,
      'describe': "Define which device name to use. It's used only for mobile platform, e.g: 'iPhone Simulator', 'Motorola Atrix HD Emulator', 'LG Optimus 3D Emulator', 'Google Nexus 7C Emulator'"
    })
    .options('deviceOrientationSL', {
      'alias':    'do',
      'default':  defaults.deviceOrientationSL,
      'describe': "Define the device orientation. It's used only for mobile platform, e.g: 'portrait', 'landscape'"
    })
    .options('tunnelIdentifierSL', {
      'alias':    't',
      'default':  defaults.tunnelIdentifierSL,
      'describe': 'Define a tunnel name'
    })
    .options('buildSL', {
      'alias':    'build',
      'default':  defaults.buildSL,
      'describe': 'Define the build name/number'
    })
    .options('tagsSL', {
      'alias':    'tg',
      'default':  defaults.tagsSL,
      'describe': 'Define tag names'
    })
    .options('sessionNameSL', {
      'alias':    'n',
      'default':  defaults.sessionNameSL,
      'describe': 'Define the session name on SauceLabs'
    })
    .options('url', {
        'alias':    'u',
        'default':  defaults.url,
        'describe': 'Define the url to access tests through saucelabs'
    })
    .options('visibilitySL', {
      'alias':    'vi',
      'default':  defaults.visibilitySL,
      'describe': 'Visibilty of the session on saucelabs'
    })
    .options('connect', {
      'alias':    'ct',
      'default':  defaults.connect,
      'boolean':  true,
      'describe': 'Connect to SauceLabs, creating a simple wrapper around the SauceConnect'
    })
    .options('connectRetries', {
      'default':  defaults.connectRetries,
      'describe': 'Try establishing the tunnel x times after a failure has occured.'
    })
    .options('attach', {
        'alias':    'at',
        'default':  defaults.attach,
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
    .parse(argv);
};