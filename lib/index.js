var updateJobStatus = require('./sauce-update-job-status.js'),
    launcher        = require('sauce-launcher-webdriver.js');

module.exports = {
  updateJobStatus: updateJobStatus,
  launcher: launcher
};
