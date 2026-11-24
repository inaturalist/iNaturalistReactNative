module.exports = {
  root: true,
  reportUnusedDisableDirectives: true,
  env: { node: true },
  globals: {
    requestIdleCallback: "readonly",
    cancelIdleCallback: "readonly",
    __DEV__: "readonly",
    HermesInternal: "readonly",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: ["@babel/preset-react"],
    },
  },
  extends: [
    "eslint:recommended",
    "@react-native",
    "plugin:@tanstack/query/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:i18next/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react-native-a11y/ios",
    // Last, because @react-native switches formatting rules off
    "./.eslintrc.formatting.js",
  ],
  plugins: [
    "@stylistic",
    "@tanstack/query",
    "@typescript-eslint",
    "import",
    "lodash",
    "module-resolver",
    "react-hooks",
    "react-native",
    "simple-import-sort",
  ],
  rules: {
    "consistent-return": [2, { treatUndefinedAsUnspecified: true }],
    "i18next/no-literal-string": [
      2,
      {
        words: {
          // Minor change to the default to disallow all-caps string literals as well
          exclude: ["[0-9!-/:-@[-`{-~]+"],
        },
      },
    ],
    "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
    // Use the plugin defaults
    // (https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-extraneous-dependencies.md),
    // which allow imports of anything declared in package.json, including
    // devDependencies in utility scripts, but raise alarms when you try to
    // import things not declared in package.json.
    "import/no-extraneous-dependencies": ["error", {}],
    // Import rules formerly supplied by Airbnb, with its options
    "import/no-unresolved": ["error", { commonjs: true, caseSensitive: true }],
    "import/named": "error",
    "import/no-cycle": ["error", { maxDepth: "∞" }],
    "import/no-duplicates": "error",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/extensions": [2, {
      js: "never",
      jsx: "never",
      json: "always",
      ts: "never",
      tsx: "never",
    }],
    "no-alert": 0,
    "no-void": 0,
    "prefer-destructuring": [2, { object: true, array: false }],
    "module-resolver/use-alias": 2,
    "no-var": 1,
    "prefer-const": [2, { destructuring: "all" }],
    // "react/forbid-prop-types": 0,
    "react/function-component-definition": [
      2,
      { namedComponents: "arrow-function" },
    ],

    // React-Hooks Plugin
    // The following rules are made available via `eslint-plugin-react-hooks`
    "react-hooks/exhaustive-deps": 2,

    // React Compiler
    // These rules are specific to React Compiler.

    // @FLGMWT 20260427: the following were introduced with `react-hooks/recommended` and represent
    // cases that are very likely to cause bugs and _have definitely_ been the cause of a number of
    // bugs fixed in the past few months. Turning these on as warnings and we can eventually
    // switch to errors as we fix them : ) noting here in case it ever gets lost in Linear.
    "react-hooks/static-components": 1,
    "react-hooks/set-state-in-effect": 1,
    "react-hooks/refs": 1,
    "react-hooks/preserve-manual-memoization": 1,
    "react-hooks/purity": 1,
    "react-hooks/immutability": 1,

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

    // it's supposedly safe to remove no-undef because TS's compiler handles
    // this, but I'm bumping into this error a lot in VSCode - 20240624 amanda
    // https://eslint.org/docs/latest/rules/no-undef#handled_by_typescript
    "no-undef": "error",

    "@typescript-eslint/array-type": ["error", {
      default: "array",
    }],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "after-used",
        // Allow leading underscore to indicate unused var
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
        caughtErrors: "all",
        // needed a special case for catch blocks that use _ to define an unused error
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    "@typescript-eslint/no-require-imports": ["error", {
      allow: ["\\.(png|jpg|jpeg|gif|svg|json)$"],
    }],
    "@typescript-eslint/no-unsafe-function-type": 1,
    "@typescript-eslint/consistent-type-imports": ["error", {
      fixStyle: "separate-type-imports",
    }],

    "@stylistic/member-delimiter-style": "error",

    "lodash/import-scope": 2,
  },
  ignorePatterns: ["!.detoxrc.js", "/coverage/*", "/vendor/*", "**/flow-typed"],
  settings: {
    // Import plugin settings formerly supplied by Airbnb
    "import/extensions": [".js", ".mjs", ".jsx"],
    "import/core-modules": [],
    "import/ignore": ["node_modules", "\\.(coffee|scss|css|less|hbs|svg|json)$"],
    "import/resolver": {
      "babel-module": { allowExistingDirectories: true },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        moduleDirectory: ["node_modules", "src"],
      },
    },
  },
  overrides: [
    {
      files: ["*.js", "*.jsx"],
      // Keep JS on the TypeScript parser instead of the base's Babel parser
      parser: "@typescript-eslint/parser",
      rules: {
        "import/consistent-type-specifier-style": "off",
        "@stylistic/member-delimiter-style": "off",
        "@typescript-eslint/consistent-type-definitions": "off",
        "@typescript-eslint/consistent-type-imports": "off",
        "@typescript-eslint/no-require-imports": "off",
        "@typescript-eslint/no-unsafe-function-type": "off",
        "@typescript-eslint/no-wrapper-object-types": "off",
      },
    },
    {
      files: ["*.test.js", "*.test.tsx"],
      rules: {
        "react/jsx-props-no-spreading": "off",
      },
    },
    {
      files: ["**/__mocks__/**/*", "**/*mock*", "**/*.mock.*"],
      rules: {
        "@typescript-eslint/no-require-imports": "off",
      },
    },
    {
      files: ["tests/**/*", "__mocks__/**/*", "e2e/**/*"],
      env: { jest: true },
    },
    {
      files: ["tests/**/*"],
      plugins: ["testing-library"],
      extends: ["plugin:testing-library/react"],
    },
  ],
};
