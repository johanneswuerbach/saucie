var updateJobStatus = require('./sauce-update-job-status.js'),
    launcher        = require('sauce-launcher-webdriver.js');

if (!module.parent) {

  launcher();

} else {

  module.exports = {
    updateJobStatus: updateJobStatus,
    launcher: launcher
  };

}
