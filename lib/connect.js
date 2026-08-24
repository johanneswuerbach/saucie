var spawn = require('cross-spawn');
var https = require('https');
var http = require('http');
var fs = require('fs');
var path = require('path');
var os = require('os');
var defaults = require('./default-options');

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

function waitForReadiness(port, maxRetries, interval, callback) {
  var retries = 0;

  function check() {
    var req = http.get({
      hostname: 'localhost',
      port: port,
      path: '/readyz'
    }, function(res) {
      res.resume();
      if (res.statusCode === 200) { return callback(null); }
      retry();
    });
    req.setTimeout(2000, function() { req.destroy(); retry(); });
    req.on('error', retry);
  }

  function retry() {
    if (++retries >= maxRetries) {
      return callback(new Error('Sauce Connect readiness check timed out after ' + maxRetries + ' retries'));
    }
    setTimeout(check, interval);
  }

  check();
}

function waitForApiReadiness(opts, maxRetries, interval, callback, deps) {
  deps = deps || {};
  var httpsMod = deps.https || https;

  if (!opts.username || !opts.accessKey) {
    return callback(new Error('SAUCE_USERNAME and SAUCE_ACCESS_KEY are required'));
  }

  var auth = Buffer.from(opts.username + ':' + opts.accessKey).toString('base64');
  var retries = 0;
  var done = false;
  var activeReq = null;
  var retryTimer = null;

  function finish(err) {
    if (done) { return; }
    done = true;
    if (retryTimer) { clearTimeout(retryTimer); }
    if (activeReq && activeReq.destroy) { activeReq.destroy(); }
    callback(err);
  }

  function retry() {
    if (done) { return; }
    if (activeReq && activeReq.destroy) {
      activeReq.destroy();
      activeReq = null;
    }
    if (++retries >= maxRetries) {
      return finish(new Error(
        'Sauce Connect API readiness timed out waiting for tunnel "' + opts.tunnelIdentifier + '"'
      ));
    }
    retryTimer = setTimeout(check, interval);
  }

  function check() {
    if (done) { return; }
    retryTimer = null;

    activeReq = httpsMod.get({
      hostname: 'api.us-west-1.saucelabs.com',
      path: '/rest/v1/' + opts.username + '/tunnels?full=1',
      headers: { 'Authorization': 'Basic ' + auth }
    }, function(res) {
      if (done) { return; }

      if (res.statusCode === 401 || res.statusCode === 403) {
        return finish(new Error(
          'Sauce Connect API authentication failed (HTTP ' + res.statusCode + ')'
        ));
      }

      if (res.statusCode && res.statusCode !== 200) {
        res.resume();
        return retry();
      }

      var data = '';
      res.on('data', function(chunk) { data += chunk; });
      res.on('end', function() {
        if (done) { return; }

        var tunnels;
        try {
          tunnels = JSON.parse(data);
        } catch (e) {
          return retry();
        }

        if (Array.isArray(tunnels)) {
          var ready = tunnels.some(function(t) {
            return t.tunnel_identifier === opts.tunnelIdentifier && t.is_ready === true;
          });
          if (ready) {
            activeReq = null;
            return finish(null);
          }
        }

        retry();
      });
    });
    activeReq.on('error', function() {
      if (!done) { retry(); }
    });
  }

  check();
}

function ensureScBinaryAsync(logger) {
  return new Promise(function(resolve, reject) {
    ensureScBinary(logger, function(err, binPath) {
      if (err) {
        reject(err);
      } else {
        resolve(binPath);
      }
    });
  });
}

function stopExistingTunnelsAsync(opts) {
  return new Promise(function(resolve) {
    stopExistingTunnels(opts, resolve);
  });
}

function prepareScBinary(opts, deps) {
  deps = deps || {};
  var ensure = deps.ensureScBinaryAsync || ensureScBinaryAsync;
  var stop = deps.stopExistingTunnelsAsync || stopExistingTunnelsAsync;

  return ensure(opts.logger).then(function(binPath) {
    return stop(opts).then(function() {
      return binPath;
    });
  });
}

function spawnScProcess(opts, binPath, resolve, reject) {
  var apiPort = opts.readinessPort || 8032;
  var args = ['run'];
  args.push('--api-address', 'localhost:' + apiPort);
  args.push('--region', opts.region || 'us-west');
  if (opts.username)         { args.push('--username', opts.username); }
  if (opts.accessKey)        { args.push('--access-key', opts.accessKey); }
  if (opts.tunnelIdentifier) { args.push('--tunnel-name', opts.tunnelIdentifier); }
  if (opts.tunnelDomains)    { args.push('--tunnel-domains', opts.tunnelDomains); }
  args.push('--proxy-localhost', 'allow');

  var spawnOpts = opts.detached
    ? { detached: true, stdio: 'ignore' }
    : { stdio: ['ignore', 'pipe', 'pipe'] };

  var child = spawn(binPath, args, spawnOpts);
  var settled = false;

  function killChild() {
    if (child.exitCode !== null || child.signalCode !== null) { return; }
    try {
      child.kill('SIGTERM');
    } catch (err) {
      if (err.code !== 'ESRCH') { throw err; }
    }
  }

  function fail(err) {
    if (!settled) {
      settled = true;
      child.removeListener('exit', onEarlyExit);
      killChild();
      reject(err);
    }
  }

  child.on('error', fail);

  function onEarlyExit(code) {
    fail(new Error('sc exited with code ' + code + ' before becoming ready'));
  }

  child.on('exit', onEarlyExit);

  if (!opts.detached) {
    function handleOutput(data) {
      if (opts.logger) { opts.logger(data.toString()); }
    }
    child.stdout.on('data', handleOutput);
    child.stderr.on('data', handleOutput);
  }

  waitForReadiness(apiPort, 60, 1000, function(readyErr) {
    if (settled) { return; }
    if (readyErr) { return fail(readyErr); }

    function finishConnect() {
      if (settled) { return; }
      settled = true;

      if (opts.detached) {
        child.removeListener('exit', onEarlyExit);
        child.unref();
      }

      if (opts.pidfile) {
        fs.writeFileSync(opts.pidfile, String(child.pid));
      }

      if (opts.logger) {
        opts.logger('# Sauce Connect tunnel ready (pid ' + child.pid + ', name "' + opts.tunnelIdentifier + '")');
      }

      if (opts.detached) {
        resolve({ pid: child.pid });
      } else {
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

    if (opts.waitForApiReady) {
      waitForApiReadiness(
        opts,
        opts.apiReadyMaxRetries || 120,
        opts.apiReadyInterval || 1000,
        function(apiErr) {
          if (settled) { return; }
          if (apiErr) { return fail(apiErr); }
          finishConnect();
        }
      );
    } else {
      finishConnect();
    }
  });
}

function spawnSc(opts) {
  return prepareScBinary(opts).then(function(binPath) {
    return new Promise(function(resolve, reject) {
      spawnScProcess(opts, binPath, resolve, reject);
    });
  });
}

function connect(userOpts) {
  var opts = Object.assign({}, defaults, userOpts);
  return spawnSc(opts);
}

connect.waitForApiReadiness = waitForApiReadiness;
connect.prepareScBinary = prepareScBinary;

module.exports = connect;
