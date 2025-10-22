module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: ["@babel/preset-react"]
    }
  },
  extends: [
    "airbnb",
    "plugin:i18next/recommended",
    "plugin:@tanstack/eslint-plugin-query/recommended",
    "plugin:react-native-a11y/ios",
    "plugin:@typescript-eslint/recommended"
  ],
  plugins: [
    "module-resolver",
    "react-hooks",
    "react-native",
    "simple-import-sort",
    "@tanstack/query",
    "@typescript-eslint"
  ],
  rules: {
    "arrow-parens": [2, "as-needed"],
    "comma-dangle": [2, "never"],
    "consistent-return": [2, { treatUndefinedAsUnspecified: true }],
    "func-names": 0,
    "global-require": 0,
    "i18next/no-literal-string": [
      2,
      {
        words: {
          // Minor change to the default to disallow all-caps string literals as well
          exclude: ["[0-9!-/:-@[-`{-~]+"]
        }
      }
    ],
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
    "import/extensions": [2, {
      js: "never",
      jsx: "never",
      json: "always",
      ts: "never",
      tsx: "never"
    }],
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
        ignoreTemplateLiterals: false
      }
    ],
    "no-alert": 0,
    "no-underscore-dangle": 0,
    "no-void": 0,
    "prefer-destructuring": [2, { object: true, array: false }],
    quotes: [2, "double"],
    "space-in-parens": [2, "always"],
    "max-classes-per-file": 0,
    "module-resolver/use-alias": 2,
    "multiline-ternary": ["error", "always"],
    // At least before we start making production builds
    "no-console": 0,
    "no-restricted-globals": 0,
    "no-param-reassign": 0,
    "no-var": 1,
    "operator-linebreak": [2, "before"],
    "prefer-const": [2, { destructuring: "all" }],
    // "react/forbid-prop-types": 0,
    "react/prop-types": 0,
    "react/destructuring-assignment": 0,
    "react/jsx-filename-extension": 0,
    "react/function-component-definition": [
      2,
      { namedComponents: "arrow-function" }
    ],
    "react/require-default-props": 0,

    // React-Hooks Plugin
    // The following rules are made available via `eslint-plugin-react-hooks`
    "react-hooks/rules-of-hooks": 2,
    "react-hooks/exhaustive-deps": 2,
    "react-hooks/react-compiler": "error",

    "react-native/no-inline-styles": "error",

    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "react-native-a11y/has-accessibility-hint": 0,
    "react-native-a11y/has-accessibility-props": 1,
    "react-native-a11y/has-valid-accessibility-actions": 1,
    "react-native-a11y/has-valid-accessibility-role": 1,
    "react-native-a11y/has-valid-accessibility-state": 1,
    "react-native-a11y/has-valid-accessibility-states": 1,
    "react-native-a11y/has-valid-accessibility-component-type": 1,
    "react-native-a11y/has-valid-accessibility-traits": 1,
    "react-native-a11y/has-valid-accessibility-value": 1,
    "react-native-a11y/no-nested-touchables": 1,
    "react-native-a11y/has-valid-accessibility-descriptors": 1,
    "react-native-a11y/has-valid-accessibility-ignores-invert-colors": 1,
    "react-native-a11y/has-valid-accessibility-live-region": 1,
    "react-native-a11y/has-valid-important-for-accessibility": 1,
    "no-shadow": "off",

    // it's supposedly safe to remove no-undef because TS's compiler handles
    // this, but I'm bumping into this error a lot in VSCode - 20240624 amanda
    // https://eslint.org/docs/latest/rules/no-undef#handled_by_typescript
    "no-undef": "error",

    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "after-used",
        // Overriding airbnb to allow leading underscore to indicate unused var
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
        caughtErrors: "all",
        // needed a special case for catch blocks that use _ to define an unused error
        caughtErrorsIgnorePattern: "^_"
      }
    ],
    "@typescript-eslint/no-require-imports": ["error", {
      allow: ["\\.(png|jpg|jpeg|gif|svg)$"]
    }],
    "@typescript-eslint/no-unsafe-function-type": 1
  },
  ignorePatterns: ["!.detoxrc.js", "/coverage/*", "/vendor/*", "**/flow-typed"],
  settings: {
    "import/resolver": {
      "babel-module": { allowExistingDirectories: true },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        moduleDirectory: ["node_modules", "src"]
      }
    }
  },
  overrides: [
    {
      files: ["*.js", "*.jsx"],
      rules: {
        "@typescript-eslint/no-unsafe-function-type": "off",
        "@typescript-eslint/no-wrapper-object-types": "off",
        "@typescript-eslint/no-require-imports": "off"
      }
    },
    {
      files: ["**/__mocks__/**/*", "**/*mock*", "**/*.mock.*"],
      rules: {
        "@typescript-eslint/no-require-imports": "off"
      }
    },
    {
      files: ["tests/**/*", "__mocks__/**/*", "e2e/**/*"],
      env: { jest: true }
    },
    {
      files: ["tests/**/*"],
      plugins: ["testing-library"],
      extends: ["plugin:testing-library/react"]
    }
  ]
};
