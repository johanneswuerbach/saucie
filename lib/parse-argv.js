var commander = require('commander');

var defaults = require('./default-options');

module.exports = function(argv) {
  return new commander.Command()
    .description('a JS test runner using Sauce Labs. Supports Mocha, Qunit and Jasmine tests. Please make sure you have a file named testem.yml in the folder.')
    .option('-u, --username <username>', 'Define the SauceLabs user name [$SAUCE_USERNAME]')
    .option('-k, --accesskey <key>', 'Define the SauceLabs access key [$SAUCE_ACCESS_KEY]')
    .option('-b, --browserNameSL <name>', `Define the browser, e.g.: 'internet explorer', 'firefox', 'chrome' [${defaults.browserNameSL}]`, defaults.browserNameSL)
    .option('-v, --versionSL <version>', 'Define the browser version', defaults.versionSL)
    .option('-p, --platformNameSL <platform>', "Define the platform to run the tests, e.g: 'Linux', 'Windows', 'iOS'", defaults.platformNameSL)
    .option('--platformVersionSL <version>', "Define the platform version to run the tests, e.g: 'XP', '9.3'", defaults.platformVersionSL)
    .option('--deviceNameSL <name>', "Define which device name to use. It's used only for mobile platform, e.g: 'iPhone Simulator', 'Motorola Atrix HD Emulator', 'LG Optimus 3D Emulator', 'Google Nexus 7C Emulator'")
    .option('--deviceOrientationSL <orientation>', "Define the device orientation. It's used only for mobile platform, e.g: 'portrait', 'landscape'")
    .option('-t, --tunnelIdentifierSL <name>', 'Define a tunnel name [$TRAVIS_JOB_NUMBER]', defaults.tunnelIdentifierSL)
    .option('--buildSL <name>', 'Define the build name/number [$TRAVIS_BUILD_NUMBER]', defaults.buildSL)
    .option('--tagsSL <tag>', `Attach a tag [${defaults.tagsSL}]`, (tag, tags) => {
      tags.push(tag);
      return tags;
    }, [])
    .option('-n, --sessionNameSL <name>', `Define the session name on SauceLabs [${defaults.sessionNameSL}]`, defaults.sessionNameSL)
    .option('-u, --url <url>', `Define the url to access tests through saucelabs [${defaults.url}]`, defaults.url)
    .option('--visibilitySL <visibility>', `Visibilty of the session on saucelabs [${defaults.visibilitySL}]`, defaults.visibilitySL)
    .option('--no-connect', 'Connect to SauceLabs, creating a simple wrapper around the SauceConnect')
    .option('--connectRetries <n>', 'Try establishing the tunnel x times after a failure has occured.', n => parseInt(n, 10), defaults.connectRetries)
    .option('--attach', 'Attach to the launched browser')
    .option('--timeout <timeout>', 'Timeout in seconds until tests need to finish')
    .option('--vmVersion <version>', 'Choose dev-varnish to enable websocket support')
    .option('--tunnelDomains <domains>', 'A comma separated list of domains to send through the tunnel')
    .parse(argv);
};