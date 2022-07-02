module.exports = {
  root: true,
  extends: ["@react-native-community", "plugin:i18next/recommended"],
  rules: {
    quotes: [2, "double"],
    "comma-dangle": [2, "never"],
    "space-in-parens": [2, "always"],
    "prettier/prettier": 0,
    "i18next/no-literal-string": [2, {
      words: {
        // Minor change to the default to disallow all-caps string literals as well
        exclude: ["[0-9!-/:-@[-`{-~]+"]
      }
    }],
    "no-var": 1
  },
  // need this so jest doesn't show as undefined in jest.setup.js
  env: {
    "jest": true
  },
  ignorePatterns: ["/coverage/*"]
};
