module.exports = {
  maxWorkers: 4,
  testTimeout: 900000,
  rootDir: "..",
  testMatch: ["<rootDir>/e2e/**/*.e2e.js"],
  verbose: true,
  reporters: ["detox/runners/jest/reporter"],
  globalSetup: "detox/runners/jest/globalSetup",
  globalTeardown: "detox/runners/jest/globalTeardown",
  testEnvironment: "detox/runners/jest/testEnvironment"
};
