import type { Config } from "jest";

const ignorePatterns = "node_modules/(?!(jest-)?@react-native|react-native|"
    + "react-clone-referenced-element|@react-native-community|expo(nent)?|"
    + "@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|"
    + "unimodules|sentry-expo|native-base||(?!react-native-redash))|jest-runner";

const config: Config = {
  moduleNameMapper: {
    "\\.svg": "<rootDir>/tests/mocks/svgMock.js"
  },
  preset: "react-native",
  setupFiles: [
    "./node_modules/react-native-gesture-handler/jestSetup.js",
    "<rootDir>/tests/jest.setup.js"
  ],
  globalSetup: "<rootDir>/tests/jest.globalSetup.js",
  setupFilesAfterEnv: [
    "react-native-accessibility-engine",
    "<rootDir>/tests/jest.post-setup.js",
    "<rootDir>/tests/realm.setup.js",
    "<rootDir>/tests/initI18next.setup.js"
  ],
  transformIgnorePatterns: [ignorePatterns],
  verbose: true
  // uncomment reporters below to see which tests are running the slowest in jest
  // reporters: [
  //   ["jest-slow-test-reporter", {"numTests": 8, "warnOnSlowerThan": 300, "color": true}]
  // ],
};

export default config;
