const setupFilesAfterEnv = [
  "<rootDir>/tests/jest.post-setup.js",
  "<rootDir>/tests/realm.setup.js"
];
if ( !process.env.REASSURE_TEST ) {
  setupFilesAfterEnv.push( "react-native-accessibility-engine" );
}

const config = {
  preset: "react-native",
  setupFiles: [
    "./node_modules/react-native-gesture-handler/jestSetup.js",
    "<rootDir>/tests/jest.setup.js"
  ],
  setupFilesAfterEnv,
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?@react-native|react-native|react-clone-referenced-element|"
    + "@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|"
    + "@unimodules/.*|unimodules|sentry-expo|native-base||(?!react-native-redash))|jest-runner"
  ],
  automock: false,
  resetMocks: false,
  verbose: true
};

if ( !process.env.REASSURE_TEST ) {
  config.moduleNameMapper = {
    "\\.svg": "<rootDir>/tests/mocks/svgMock.js"
  };
}

console.log( "final jest config: ", config );

module.exports = config;
