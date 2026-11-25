// House formatting style. Extended last in .eslintrc.js because the
// @react-native base switches formatting rules off.
module.exports = {
  rules: {
    quotes: [2, "double"],
    "space-in-parens": [2, "always"],
    indent: ["error", 2, { SwitchCase: 1 }],
    "max-len": [
      "error",
      100,
      2,
      {
        ignoreUrls: true,
        ignoreComments: false,
        ignoreRegExpLiterals: true,
        ignoreStrings: false,
        ignoreTemplateLiterals: false,
      },
    ],
    // enforces trailing comma in objects / arrays except inline: no [1,2,3,]
    // functionally, this improves git deltas when the last items of {}/[] are changed
    "comma-dangle": ["error", "always-multiline"],
    "arrow-parens": [2, "as-needed"],
    "operator-linebreak": [2, "before"],
    "multiline-ternary": ["error", "always"],
  },
};
