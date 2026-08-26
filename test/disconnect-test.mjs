import { expect } from 'chai';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

var require = createRequire(import.meta.url);
var disconnect = require('../lib/disconnect.js');

function tempPidFile() {
  return path.join(os.tmpdir(), 'saucie-disconnect-' + process.pid + '-' + Date.now() + '.pid');
}

describe('disconnect()', function() {
  this.timeout(10000);

  it('ignores a missing pid file', function() {
    return disconnect(path.join(os.tmpdir(), 'saucie-missing-' + Date.now() + '.pid'));
  });

  it('ignores a stale pid', function() {
    var pidFile = tempPidFile();
    fs.writeFileSync(pidFile, '999999999');
    return disconnect(pidFile).then(function() {
      expect(fs.existsSync(pidFile)).to.equal(false);
    });
  });

  it('rejects invalid pid content gracefully', function() {
    var pidFile = tempPidFile();
    fs.writeFileSync(pidFile, '0');
    return disconnect(pidFile).then(function() {
      expect(fs.existsSync(pidFile)).to.equal(true);
    }).finally(function() {
      fs.unlinkSync(pidFile);
    });
  });

  it('stops a process and removes the pid file', function(done) {
    var pidFile = tempPidFile();
    var child = spawn('sleep', ['30']);

    child.on('error', function(err) {
      done(err);
    });

    fs.writeFileSync(pidFile, String(child.pid));

    disconnect(pidFile).then(function() {
      expect(fs.existsSync(pidFile)).to.equal(false);
      child.on('exit', function() {
        done();
      });
      setTimeout(function() {
        try {
          process.kill(child.pid, 0);
          child.kill('SIGKILL');
        } catch (e) {
          done();
        }
      }, 1000);
    }).catch(done);
  });
});
