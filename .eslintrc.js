module.exports = {
  root: true,
  extends: ["@react-native-community", "plugin:i18next/recommended"],
  rules: {
    quotes: [2, "double"],
    "comma-dangle": [2, "never"],
    "space-in-parens": [2, "always"],
    "prettier/prettier": 0,
    "no-var": 1
  },
  // need this so jest doesn't show as undefined in jest.setup.js
  env: {
    "jest": true
  },
  ignorePatterns: ["/coverage/*"]
};
