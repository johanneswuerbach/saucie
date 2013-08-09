var yaml        = require('js-yaml'),
    webdriver   = require('wd'),
    fs          = require('fs'),
    content_yml = fs.readFileSync('sauce.yml', 'utf8'),
    config_yml  = yaml.load(content_yml),
    config      = module.exports = config_yml || {},
    argv        = config.argv = require('optimist').argv,
    libraryName = config.libraryName = "Sauce Integration",

    auth              = config.auth = config.auth || {},
    auth['username']  = process.env.SAUCE_USERNAME,
    auth['accessKey'] = process.env.SAUCE_ACCESS_KEY,
    auth['build']     = config['build'] || process.env.TRAVIS_BUILD_NUMBER || "dev-tests",
    auth['tunnelIdentifier'] = config['tunnelIdentifier'] || process.env.TRAVIS_JOB_NUMBER || libraryName,

    desired           = config.desired = config.desired || {}
    desired['tags']   = desired['tags']   || [libraryName, "test"],
    desired['name']   = desired['name']   || libraryName + " tests",
    desired['public'] = desired['public'] || "public",
    desired['build']  = auth['build'],
    desired['tunnel-identifier'] = auth['tunnelIdentifier']

    launcher              = config.launcher = config.launcher || {},
    launcher['username']  = auth['username'],
    launcher['accessKey'] = auth['accessKey'],
    launcher['logfile']   = launcher['logfile'] || 'sauce-example.log', //optionally change sauce connect logfile location
    launcher['tunnelIdentifier'] = auth['tunnelIdentifier'], // optionally identity the tunnel for concurrent tunnels
    launcher['logger']    = console.log

    host    = "ondemand.saucelabs.com",
    port    = 80,
    browser = config.browser = webdriver.remote(host, port, auth.username, auth.accessKey);

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
