var commander = require('commander');

var defaults = require('./default-options');

module.exports = function(argv) {
  var result = new commander.Command()
    .description('a JS test runner using Sauce Labs. Supports Mocha, Qunit and Jasmine tests. Please make sure you have a file named testem.yml in the folder.')
    .option('-U, --username <username>', 'Define the SauceLabs user name [$SAUCE_USERNAME]')
    .option('-k, --accesskey <key>', 'Define the SauceLabs access key [$SAUCE_ACCESS_KEY]')
    .option('-b, --browser <name>', `Define the browser, e.g.: 'internet explorer', 'firefox', 'chrome' [${defaults.browser}]`, defaults.browser)
    .option('-v, --version <version>', 'Define the browser version', defaults.version)
    .option('-p, --platform <platform>', "Define the platform to run the tests, e.g: 'Linux', 'Windows', 'iOS'", defaults.platform)
    .option('--platform-version <version>', "Define the platform version to run the tests, e.g: 'XP', '9.3'", defaults.platformVersion)
    .option('--device-name <name>', "Define which device name to use. It's used only for mobile platform, e.g: 'iPhone Simulator', 'Motorola Atrix HD Emulator', 'LG Optimus 3D Emulator', 'Google Nexus 7C Emulator'")
    .option('--device-orientation <orientation>', "Define the device orientation. It's used only for mobile platform, e.g: 'portrait', 'landscape'")
    .option('-t, --tunnel-identifier <name>', 'Define a tunnel name [$TRAVIS_JOB_NUMBER]', defaults.tunnelIdentifier)
    .option('--build <name>', 'Define the build name/number [$TRAVIS_BUILD_NUMBER]', defaults.build)
    .option('--tag <tag>', `Attach a tag [${defaults.tags}]`, (tag, tags) => {
      tags.push(tag);
      return tags;
    }, [])
    .option('-n, --session-name <name>', `Define the session name on SauceLabs [${defaults.sessionName}]`, defaults.sessionName)
    .option('-u, --url <url>', `Define the url to access tests through saucelabs [${defaults.url}]`, defaults.url)
    .option('--visibility <visibility>', `Visibilty of the session on saucelabs [${defaults.visibility}]`, defaults.visibility)
    .option('--no-connect', 'Connect to SauceLabs, creating a simple wrapper around the SauceConnect')
    .option('-r, --connect-retries <n>', 'Try establishing the tunnel x times after a failure has occured.', n => parseInt(n, 10), defaults.connectRetries)
    .option('--attach', 'Attach to the launched browser')
    .option('--timeout <timeout>', 'Timeout in seconds until tests need to finish')
    .option('--max-duration <duration>', "Maximum duration for the Saucelabs session in seconds (Saucelabs's default is 1800; hard limit is 10800)")
    .option('--vmVersion <version>', 'Choose dev-varnish to enable websocket support')
    .option('--tunnelDomains <domains>', 'A comma separated list of domains to send through the tunnel')
    .parse(argv);

  result.tags = result.tag;
  if (result.tags.length === 0) {
    result.tags = defaults.tags;
  }

  return result;
};
