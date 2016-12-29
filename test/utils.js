var http = require('http');
var fs = require('fs');
var path = require('path');

module.exports.serveQUnit = function(port, callback) {
  var server = http.createServer(function (request, response) {
    switch (request.url) {
      case '/':
        response.writeHead(200, {'Content-Type': 'text/html'});
        fs.createReadStream(path.join(__dirname, 'fixtures/qunit/index.html')).pipe(response);
        break;
      case '/slow':
        setTimeout(function() {
          response.writeHead(200, { 'Content-Type': 'text/plain' });
          response.end('OK');
        }, 1500);
        break;
      case '/qunit-reporter.js':
        response.writeHead(200, {'Content-Type': 'application/javascript'});
        fs.createReadStream(path.join(__dirname, '../lib/js-testing-reporter-adapter/qunit-reporter.js')).pipe(response);
        break;
      default:
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('Not found');
      }
  });

  server.on('error', function(err) {
    callback(err);
  });

  server.listen(port, function() {
    callback(null, server);
  });
};
