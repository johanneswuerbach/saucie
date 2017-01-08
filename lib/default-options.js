var libraryName = "Saucie";

module.exports = {
  browser: 'chrome',
  version: '',
  platform: '',
  platformVersion: '',
  deviceName: '',
  deviceOrientation: '',
  tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
  build: process.env.TRAVIS_BUILD_NUMBER,
  tags: [libraryName, "test"],
  sessionName: libraryName + " tests",
  url: 'http://localhost:8080',
  visibility: "public",
  connect: true,
  connectRetries: 2,
  downloadRetries: 2,
  attach: false,
};
