var fs             = require('fs'),
    async          = require('async'),
    folder_adapter = './lib/js-testing-reporter-adapter/';

module.exports = function(callback) {
  fs.readdir(folder_adapter, function(err, files) {
    err && callback(err);

    var JSTestingReporterSL = "";
    async.each( files, function(file, callback) {

      fs.readFile(folder_adapter+file, 'utf8', function (err, data) {
        JSTestingReporterSL += data + '\n';
        callback(err);
      });

    }, function(err) {
      JSTestingReporterSL = err ? {} : "(function(undefined) {" + JSTestingReporterSL + " return JSTestingReporterSL(); })()";
      callback && callback(err, JSTestingReporterSL);
    });

  });
};
