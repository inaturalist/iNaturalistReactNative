import type { Config } from "jest";

const ignorePatterns = "node_modules/(?!(jest-)?@react-native|react-native|"
    + "react-clone-referenced-element|@react-native-community|expo(nent)?|"
    + "@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|"
    + "unimodules|sentry-expo|native-base||(?!react-native-redash))|jest-runner";

const config: Config = {
  moduleNameMapper: {
    "\\.svg": "<rootDir>/tests/mocks/svgMock.js",
  },
  preset: "react-native",
  setupFiles: [
    "./node_modules/react-native-gesture-handler/jestSetup.js",
    "./node_modules/@react-native-google-signin/google-signin/jest/build/jest/setup.js",
    "<rootDir>/tests/jest.setup.js",
  ],
  globalSetup: "<rootDir>/tests/jest.globalSetup.js",
  setupFilesAfterEnv: [
    "<rootDir>/tests/jest.post-setup.js",
    "<rootDir>/tests/realm.setup.js",
    "<rootDir>/tests/initI18next.setup.js",
  ],
  transformIgnorePatterns: [ignorePatterns],
  // uncomment the line below to enable verbose logging of test results
  // verbose: true,
  testPathIgnorePatterns: [
    "<rootDir>/tests/integration/broken",
    "<rootDir>/tests/integration/navigation/broken",
  ],
  // uncomment reporters below to see which tests are running the slowest in jest
  // reporters: [
  //   ["jest-slow-test-reporter", {"numTests": 8, "warnOnSlowerThan": 300, "color": true}]
  // ],
};

export default config;
