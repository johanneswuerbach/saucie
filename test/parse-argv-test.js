var expect = require('chai').expect;

var parseArgv = require('..').parseArgv;

function _parseArgv(args) {
  args.unshift('lib/bin.js');
  args.unshift('/usr/local/bin/node');
  return parseArgv(args);
}

describe('parseArgv()', function() {
  describe('browser', function() {
    it('defaults to "chrome"', function() {
      var result = _parseArgv([]);
      expect(result.browser).to.equal('chrome');
    });

    it('can be set to "foobar"', function() {
      var result = _parseArgv(['--browser', 'foobar']);
      expect(result.browser).to.equal('foobar');
    });

    it('can be set to "foobar" via alias', function() {
      var result = _parseArgv(['-b', 'foobar']);
      expect(result.browser).to.equal('foobar');
    });
  });

  describe('version', function() {
    it('defaults to ""', function() {
      var result = _parseArgv([]);
      expect(result.version).to.equal('');
    });

    it('can be set to "4.2"', function() {
      var result = _parseArgv(['--version', '4.2']);
      expect(result.version).to.equal('4.2');
    });

    it('can be set to "4.2" via alias', function() {
      var result = _parseArgv(['-v', '4.2']);
      expect(result.version).to.equal('4.2');
    });
  });

  describe('platform', function() {
    it('defaults to ""', function() {
      var result = _parseArgv([]);
      expect(result.platform).to.equal('');
    });

    it('can be set to "foobar"', function() {
      var result = _parseArgv(['--platform', 'foobar']);
      expect(result.platform).to.equal('foobar');
    });

    it('can be set to "foobar" via alias', function() {
      var result = _parseArgv(['-p', 'foobar']);
      expect(result.platform).to.equal('foobar');
    });
  });

  describe('platformVersion', function() {
    it('defaults to ""', function() {
      var result = _parseArgv([]);
      expect(result.platformVersion).to.equal('');
    });

    it('can be set to "4.2"', function() {
      var result = _parseArgv(['--platform-version', '4.2']);
      expect(result.platformVersion).to.equal('4.2');
    });
  });

  describe('tunnelIdentifier', function() {
    it('defaults to $TRAVIS_JOB_NUMBER', function() {
      var result = _parseArgv([]);
      expect(result.tunnelIdentifier).to.equal(process.env.TRAVIS_JOB_NUMBER);
    });

    it('can be set to "foobar"', function() {
      var result = _parseArgv(['--tunnel-identifier', 'foobar']);
      expect(result.tunnelIdentifier).to.equal('foobar');
    });

    it('can be set to "foobar" via alias', function() {
      var result = _parseArgv(['-t', 'foobar']);
      expect(result.tunnelIdentifier).to.equal('foobar');
    });
  });

  describe('build', function() {
    it('defaults to $TRAVIS_BUILD_NUMBER', function() {
      var result = _parseArgv([]);
      expect(result.build).to.equal(process.env.TRAVIS_BUILD_NUMBER);
    });

    it('can be set to "foobar"', function() {
      var result = _parseArgv(['--build', 'foobar']);
      expect(result.build).to.equal('foobar');
    });
  });

  describe('tags', function() {
    it('defaults to []', function() {
      var result = _parseArgv([]);
      expect(result.tags).to.deep.equal([]);
    });

    it('can use custom tags', function() {
      var result = _parseArgv(['--tag', 'foo', '--tag', 'bar']);
      expect(result.tags).to.deep.equal(['foo', 'bar']);
    });
  });

  describe('sessionName', function() {
    it('defaults to "Saucie tests"', function() {
      var result = _parseArgv([]);
      expect(result.sessionName).to.equal('Saucie tests');
    });

    it('can be set to "foobar"', function() {
      var result = _parseArgv(['--session-name', 'foobar']);
      expect(result.sessionName).to.equal('foobar');
    });

    it('can be set to "foobar" via alias', function() {
      var result = _parseArgv(['-n', 'foobar']);
      expect(result.sessionName).to.equal('foobar');
    });
  });

  describe('connect', function() {
    it('defaults to true', function() {
      var result = _parseArgv([]);
      expect(result.connect).to.equal(true);
    });

    it('can be set to false', function() {
      var result = _parseArgv(['--no-connect']);
      expect(result.connect).to.equal(false);
    });
  });

  describe('connectRetries', function() {
    it('defaults to 2', function() {
      var result = _parseArgv([]);
      expect(result.connectRetries).to.equal(2);
    });

    it('can be set to 42', function() {
      var result = _parseArgv(['--connect-retries', '42']);
      expect(result.connectRetries).to.equal(42);
    });

    it('can be set to 42 via alias', function() {
      var result = _parseArgv(['-r', '42']);
      expect(result.connectRetries).to.equal(42);
    });
  });

  describe('attach', function() {
    it('defaults to undefined', function() {
      var result = _parseArgv([]);
      expect(result.attach).to.equal(undefined);
    });

    it('can be set to true', function() {
      var result = _parseArgv(['--attach']);
      expect(result.attach).to.equal(true);
    });
  });
});