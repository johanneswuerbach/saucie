var expect = require('chai').expect;

var parseArgv = require('..').parseArgv;

function _parseArgv(args) {
  args.unshift('lib/bin.js');
  args.unshift('/usr/local/bin/node');
  return parseArgv(args);
}

describe('parseArgv()', function() {
  describe('browserNameSL', function() {
    it('defaults to "chrome"', function() {
      var result = _parseArgv([]);
      expect(result.browserNameSL).to.equal('chrome');
    });

    it('can be set to "foobar"', function() {
      var result = _parseArgv(['--browserNameSL', 'foobar']);
      expect(result.browserNameSL).to.equal('foobar');
    });

    it('can be set to "foobar" via alias', function() {
      var result = _parseArgv(['-b', 'foobar']);
      expect(result.browserNameSL).to.equal('foobar');
    });
  });

  describe('versionSL', function() {
    it('defaults to ""', function() {
      var result = _parseArgv([]);
      expect(result.versionSL).to.equal('');
    });

    it('can be set to "4.2"', function() {
      var result = _parseArgv(['--versionSL', '4.2']);
      expect(result.versionSL).to.equal('4.2');
    });

    // this is currently broken
    it.skip('can be set to "4.2" via alias', function() {
      var result = _parseArgv(['-v', '4.2']);
      expect(result.versionSL).to.equal('4.2');
    });
  });

  describe('platformNameSL', function() {
    it('defaults to ""', function() {
      var result = _parseArgv([]);
      expect(result.platformNameSL).to.equal('');
    });

    it('can be set to "foobar"', function() {
      var result = _parseArgv(['--platformNameSL', 'foobar']);
      expect(result.platformNameSL).to.equal('foobar');
    });

    it('can be set to "foobar" via alias', function() {
      var result = _parseArgv(['-p', 'foobar']);
      expect(result.platformNameSL).to.equal('foobar');
    });
  });

  describe('platformVersionSL', function() {
    it('defaults to ""', function() {
      var result = _parseArgv([]);
      expect(result.platformVersionSL).to.equal('');
    });

    it('can be set to "4.2"', function() {
      var result = _parseArgv(['--platformVersionSL', '4.2']);
      expect(result.platformVersionSL).to.equal('4.2');
    });

    // this is currently broken
    it.skip('can be set to "4.2" via alias', function() {
      var result = _parseArgv(['--pv', '4.2']);
      expect(result.platformVersionSL).to.equal('4.2');
    });
  });

  describe('tunnelIdentifierSL', function() {
    it('defaults to $TRAVIS_JOB_NUMBER', function() {
      var result = _parseArgv([]);
      expect(result.tunnelIdentifierSL).to.equal(process.env.TRAVIS_JOB_NUMBER);
    });

    it('can be set to "foobar"', function() {
      var result = _parseArgv(['--tunnelIdentifierSL', 'foobar']);
      expect(result.tunnelIdentifierSL).to.equal('foobar');
    });

    it('can be set to "foobar" via alias', function() {
      var result = _parseArgv(['-t', 'foobar']);
      expect(result.tunnelIdentifierSL).to.equal('foobar');
    });
  });

  describe('buildSL', function() {
    it('defaults to $TRAVIS_BUILD_NUMBER', function() {
      var result = _parseArgv([]);
      expect(result.buildSL).to.equal(process.env.TRAVIS_BUILD_NUMBER);
    });

    it('can be set to "foobar"', function() {
      var result = _parseArgv(['--buildSL', 'foobar']);
      expect(result.buildSL).to.equal('foobar');
    });

    it('can be set to "foobar" via alias', function() {
      var result = _parseArgv(['--build', 'foobar']);
      expect(result.buildSL).to.equal('foobar');
    });
  });

  // this is currently broken
  describe.skip('tagsSL', function() {
    it('defaults to ["Saucie", "test"]', function() {
      var result = _parseArgv([]);
      expect(result.tagsSL).to.deep.equal(['Saucie', 'test']);
    });

    it('can use custom tags', function() {
      var result = _parseArgv(['--tagsSL', 'foo']);
      expect(result.tagsSL).to.deep.equal(['foo']);
    });

    it('can use custom tags via alias', function() {
      var result = _parseArgv(['--tg', 'foo']);
      expect(result.tagsSL).to.deep.equal(['foo']);
    });
  });

  describe('sessionNameSL', function() {
    it('defaults to "Saucie tests"', function() {
      var result = _parseArgv([]);
      expect(result.sessionNameSL).to.equal('Saucie tests');
    });

    it('can be set to "foobar"', function() {
      var result = _parseArgv(['--sessionNameSL', 'foobar']);
      expect(result.sessionNameSL).to.equal('foobar');
    });

    it('can be set to "foobar" via alias', function() {
      var result = _parseArgv(['-n', 'foobar']);
      expect(result.sessionNameSL).to.equal('foobar');
    });
  });

  describe('connect', function() {
    it('defaults to true', function() {
      var result = _parseArgv([]);
      expect(result.connect).to.equal(true);
    });

    it('can be explicitly set to true', function() {
      var result = _parseArgv(['--connect']);
      expect(result.connect).to.equal(true);
    });

    it('can be explicitly set to true via alias', function() {
      var result = _parseArgv(['--ct']);
      expect(result.connect).to.equal(true);
    });

    it('can be set to false', function() {
      var result = _parseArgv(['--no-connect']);
      expect(result.connect).to.equal(false);
    });

    it('can be set to false via alias', function() {
      var result = _parseArgv(['--no-ct']);
      expect(result.connect).to.equal(false);
    });
  });

  describe('connectRetries', function() {
    it('defaults to 2', function() {
      var result = _parseArgv([]);
      expect(result.connectRetries).to.equal(2);
    });

    it('can be set to 42', function() {
      var result = _parseArgv(['--connectRetries', '42']);
      expect(result.connectRetries).to.equal(42);
    });
  });

  describe('attach', function() {
    it('defaults to false', function() {
      var result = _parseArgv([]);
      expect(result.attach).to.equal(false);
    });

    it('can be set to true', function() {
      var result = _parseArgv(['--attach']);
      expect(result.attach).to.equal(true);
    });

    it('can be set to true via alias', function() {
      var result = _parseArgv(['--at']);
      expect(result.attach).to.equal(true);
    });

    it('can be explicitly set to false', function() {
      var result = _parseArgv(['--no-attach']);
      expect(result.attach).to.equal(false);
    });

    it('can be explicitly set to false via alias', function() {
      var result = _parseArgv(['--no-at']);
      expect(result.attach).to.equal(false);
    });
  });
});

function mockEnv(key, value, cb) {
  var hasOldValue, oldValue;
  try {
    hasOldValue = key in process.env;
    oldValue = process.env[key];

    if (value !== undefined) {
      process.env[key] = value;
    } else {
      delete process.env[key];
    }

    cb();

  } finally {
    if (hasOldValue) {
      process.env[key] = oldValue;
    } else {
      delete process.env[key];
    }
  }
}