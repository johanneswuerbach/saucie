var libraryName = "Saucie";

module.exports = {
  browserNameSL: 'chrome',
  versionSL: '',
  platformNameSL: '',
  platformVersionSL: '',
  deviceNameSL: '',
  deviceOrientationSL: '',
  tunnelIdentifierSL: process.env.TRAVIS_JOB_NUMBER,
  buildSL: process.env.TRAVIS_BUILD_NUMBER,
  tagsSL: [libraryName, "test"],
  sessionNameSL: libraryName + " tests",
  url: 'http://localhost:8080',
  visibilitySL: "public",
  connect: true,
  connectRetries: 2,
  attach: false,
};