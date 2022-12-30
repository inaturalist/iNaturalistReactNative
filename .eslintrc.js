module.exports = {
  root: true,
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: ["@babel/preset-react"]
    }
  },
  extends: [
    "airbnb",
    "plugin:i18next/recommended",
    "plugin:@tanstack/eslint-plugin-query/recommended"
  ],
  plugins: [
    "module-resolver",
    "react-hooks",
    "react-native",
    "simple-import-sort",
    "@tanstack/query"
  ],
  globals: {
    FormData: true
  },
  rules: {
    "arrow-parens": [2, "as-needed"],
    "comma-dangle": [2, "never"],
    "consistent-return": [2, { treatUndefinedAsUnspecified: true }],
    "func-names": 0,
    "global-require": 0,
    "i18next/no-literal-string": [2, {
      words: {
        // Minor change to the default to disallow all-caps string literals as well
        exclude: ["[0-9!-/:-@[-`{-~]+"]
      }
    }],
    // The AirBNB approach at
    // https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/imports.js#L71
    // is quite particular and forbids imports of devDependencies anywhere
    // outside of tests and conventional config files, which causes problem
    // if you have, say, some utility scripts that have nothing to do with
    // your actually application. Here I'm trying to use the defaults
    // (https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-extraneous-dependencies.md,
    // which allow imports of anything declared in package.json, but should
    // raise alarms when you try to import things not declared in
    // package.json.
    "import/no-extraneous-dependencies": ["error", {}],
    "max-len": ["error", 100, 2, {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: false,
      ignoreTemplateLiterals: false
    }],
    "no-alert": 0,
    "no-underscore-dangle": 0,
    "no-unused-vars": ["error", {
      vars: "all",
      args: "after-used",
      // Overriding airbnb to allow leading underscore to indicate unused var
      argsIgnorePattern: "^_",
      ignoreRestSiblings: true
    }],
    "no-void": 0,
    "prefer-destructuring": [2, { object: true, array: false }],
    quotes: [2, "double"],
    "space-in-parens": [2, "always"],
    "module-resolver/use-alias": 2,
    // At least before we start making production builds
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-restricted-globals": 0,
    "no-param-reassign": 0,
    "no-var": 1,
    "prefer-const": [2, { destructuring: "all" }],
    // "react/forbid-prop-types": 0,
    "react/prop-types": 0,
    "react/destructuring-assignment": 0,
    "react/jsx-filename-extension": 0,
    "react/function-component-definition": [2, { namedComponents: "arrow-function" }],
    "react/require-default-props": 0,

    // React-Hooks Plugin
    // The following rules are made available via `eslint-plugin-react-hooks`
    "react-hooks/rules-of-hooks": 2,
    "react-hooks/exhaustive-deps": 2,

    "react-native/no-inline-styles": "error",

    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error"
  },
  // need this so jest doesn't show as undefined in jest.setup.js
  env: {
    jest: true
  },
  ignorePatterns: ["/coverage/*"],
  settings: {
    "import/resolver": {
      "babel-module": { allowExistingDirectories: true }
    }
  }
};
