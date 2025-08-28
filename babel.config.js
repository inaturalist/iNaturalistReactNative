module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    "babel-plugin-react-compiler", // must run first!
    "react-native-worklets-core/plugin",
    "transform-inline-environment-variables",
    "nativewind/babel",
    ["module-resolver", {
      alias: {
        // constants is a reserved word, so jest won't run if we name the alias constants
        appConstants: "./src/appConstants",
        api: "./src/api",
        components: "./src/components",
        dictionaries: "./src/dictionaries",
        i18n: "./src/i18n",
        images: "./src/images",
        // for some reason, this doesn't seem to work for models, so I'm leaving that directory out
        navigation: "./src/navigation",
        providers: "./src/providers",
        realmModels: "./src/realmModels",
        sharedHelpers: "./src/sharedHelpers",
        sharedHooks: "./src/sharedHooks",
        stores: "./src/stores",
        styles: "./src/styles",
        tests: "./tests",
        uploaders: "./src/uploaders"
      }
    }],
    // Reanimated plugin has to be listed last https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation/
    [
      "react-native-reanimated/plugin",
      {
        processNestedWorklets: true
      }
    ]
  ],
  env: {
    production: {
      plugins: ["react-native-paper/babel", "transform-remove-console"]
    }
  }
};
