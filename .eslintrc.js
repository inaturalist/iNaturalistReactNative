module.exports = {
  root: true,
  extends: ["@react-native-community", "plugin:i18next/recommended"],
  rules: {
    quotes: [2, "double"],
    "comma-dangle": [2, "never"],
    "space-in-parens": [2, "always"],
    "prettier/prettier": 0,
    "no-var": 1,
    // TODO: remove this line once we have image assets and no longer need
    // placeholder text; better to enforce globalized text with errors, not warnings
    "i18next/no-literal-string": 1
  },
  // need this so jest doesn't show as undefined in jest.setup.js
  env: {
    "jest": true
  },
  ignorePatterns: ["/coverage/*"]
};
