var spawn = require('cross-spawn');
var https = require('https');
var http = require('http');
var fs = require('fs');
var path = require('path');
var os = require('os');

var SC_VERSION = '5.5.0';
var SC_BIN_DIR = path.join(__dirname, '..', '.sc-legacy');

function getPlatformInfo() {
  switch (os.platform()) {
    case 'linux':  return { suffix: 'linux.x86_64',  ext: 'tar.gz', bin: 'sc' };
    case 'darwin': return { suffix: 'darwin.all',    ext: 'zip',    bin: 'sc' };
    case 'win32':  return { suffix: 'windows.x86_64', ext: 'zip',   bin: 'sc.exe' };
    default: throw new Error('Unsupported platform: ' + os.platform());
  }
}

function getScBinPath() {
  var info = getPlatformInfo();
  return path.join(SC_BIN_DIR, info.bin);
}

function httpsGet(url, callback) {
  var mod = url.indexOf('https') === 0 ? https : http;
  mod.get(url, function (res) {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return httpsGet(res.headers.location, callback);
    }
    if (res.statusCode !== 200) {
      return callback(new Error('HTTP ' + res.statusCode + ' downloading Sauce Connect from ' + url));
    }
    callback(null, res);
  }).on('error', callback);
}

function extract(tmpFile, info, callback) {
  var child;
  if (info.ext === 'tar.gz') {
    child = spawn('tar', ['-xzf', tmpFile, '-C', SC_BIN_DIR], { stdio: 'inherit' });
  } else {
    child = spawn('unzip', ['-o', tmpFile, '-d', SC_BIN_DIR], { stdio: 'inherit' });
  }
  child.on('error', callback);
  child.on('exit', function (code) {
    if (code !== 0) {
      return callback(new Error('Extraction exited with code ' + code));
    }
    callback(null);
  });
}

function downloadSc(logger, callback) {
  var info = getPlatformInfo();
  var filename = 'sauce-connect-' + SC_VERSION + '_' + info.suffix + '.' + info.ext;
  var url = 'https://saucelabs.com/downloads/sauce-connect/' + SC_VERSION + '/' + filename;
  var tmpFile = path.join(SC_BIN_DIR, filename);

  if (!fs.existsSync(SC_BIN_DIR)) {
    fs.mkdirSync(SC_BIN_DIR, { recursive: true });
  }

  if (logger) { logger('# Downloading Sauce Connect from ' + url); }

  httpsGet(url, function (err, res) {
    if (err) { return callback(err); }

    var dest = fs.createWriteStream(tmpFile);
    res.pipe(dest);

    dest.on('error', function (e) {
      fs.unlink(tmpFile, function () {});
      callback(e);
    });

    dest.on('finish', function () {
      dest.close(function () {
        if (logger) { logger('# Extracting Sauce Connect'); }
        extract(tmpFile, info, function (extractErr) {
          fs.unlink(tmpFile, function () {});
          if (extractErr) { return callback(extractErr); }
          fs.chmod(getScBinPath(), 0o755, callback);
        });
      });
    });
  });
}

function ensureScBinary(logger, callback) {
  var binPath = getScBinPath();
  fs.access(binPath, fs.constants.X_OK, function (err) {
    if (!err) { return callback(null, binPath); }
    downloadSc(logger, function (downloadErr) {
      if (downloadErr) { return callback(downloadErr); }
      callback(null, binPath);
    });
  });
}

function stopExistingTunnels(opts, callback) {
  if (!opts.username || !opts.accessKey) { return callback(null); }

  var auth = Buffer.from(opts.username + ':' + opts.accessKey).toString('base64');

  var req = https.get({
    hostname: 'api.us-west-1.saucelabs.com',
    path: '/rest/v1/' + opts.username + '/tunnels?full=1',
    headers: { 'Authorization': 'Basic ' + auth }
  }, function(res) {
    var data = '';
    res.on('data', function(chunk) { data += chunk; });
    res.on('end', function() {
      var tunnels;
      try { tunnels = JSON.parse(data); } catch(e) { return callback(null); }
      if (!Array.isArray(tunnels) || tunnels.length === 0) { return callback(null); }

      var toStop = tunnels
        .filter(function(t) { return !opts.tunnelIdentifier || t.tunnel_identifier === opts.tunnelIdentifier; })
        .map(function(t) { return t.id; });

      if (toStop.length === 0) { return callback(null); }
      if (opts.logger) { opts.logger('# Stopping ' + toStop.length + ' existing tunnel(s) with name "' + opts.tunnelIdentifier + '"'); }

      var pending = toStop.length;
      toStop.forEach(function(id) {
        var delReq = https.request({
          method: 'DELETE',
          hostname: 'api.us-west-1.saucelabs.com',
          path: '/rest/v1/' + opts.username + '/tunnels/' + id,
          headers: { 'Authorization': 'Basic ' + auth }
        }, function(res) {
          res.resume();
          if (--pending === 0) { callback(null); }
        });
        delReq.on('error', function() {
          if (--pending === 0) { callback(null); }
        });
        delReq.end();
      });
    });
  });
  req.on('error', function() { callback(null); });
}

function spawnScLegacy(opts) {
  return new Promise(function (resolve, reject) {
    ensureScBinary(opts.logger, function (err, binPath) {
      if (err) { return reject(err); }

      stopExistingTunnels(opts, function() {
        var args = ['legacy'];
        args.push('-r', opts.region || 'us-west');
        if (opts.username)         { args.push('-u', opts.username); }
        if (opts.accessKey)        { args.push('-k', opts.accessKey); }
        if (opts.tunnelIdentifier) { args.push('-i', opts.tunnelIdentifier); }
        if (opts.tunnelDomains)    { args.push('-t', opts.tunnelDomains); }
        args.push('--proxy-localhost', 'allow');

        var child = spawn(binPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
        var started = false;

        function handleOutput(data) {
          if (opts.logger) { opts.logger(data.toString()); }
          if (!started && data.toString().indexOf('Sauce Connect is up') !== -1) {
            started = true;
            resolve({
              pid: child.pid,
              close: function (callback) {
                var timeout = setTimeout(function () {
                  child.kill('SIGTERM');
                }, 10000);
                child.once('exit', function () {
                  clearTimeout(timeout);
                  callback(null);
                });
                child.kill('SIGINT');
              }
            });
          }
        }

        child.stdout.on('data', handleOutput);
        child.stderr.on('data', handleOutput);

        child.on('error', function (err) {
          if (!started) { reject(err); }
        });

        child.on('exit', function (code) {
          if (!started) {
            reject(new Error('sc-legacy exited with code ' + code + ' before becoming ready'));
          }
        });
      });
    });
  });
}

module.exports = function connect(opts) {
  return spawnScLegacy(opts);
};
