module.exports = function ( api ) {
  api.cache.using( () => process.env.NODE_ENV );
  const isTest = api.env( "test" );

  /** @type {import('react-native-worklets/plugin').PluginOptions} */
  const workletsPluginOptions = {
    bundleMode: !isTest,
    strictGlobal: !isTest,
  };

  return {
    presets: ["module:@react-native/babel-preset", "nativewind/babel"],
    plugins: [
      "babel-plugin-react-compiler", // must run first!
      // The RN preset runs flow-strip-types on .ts files too; without this it throws on the
      // `declare` fields that type Realm model classes
      ["@babel/plugin-transform-flow-strip-types", { allowDeclareFields: true }],
      "@babel/plugin-transform-export-namespace-from",
      "transform-inline-environment-variables",
      ["module-resolver", {
        alias: {
          // constants is a reserved word, so jest won't run if we name the alias constants
          appConstants: "./src/appConstants",
          api: "./src/api",
          components: "./src/components",
          dictionaries: "./src/dictionaries",
          i18n: "./src/i18n",
          images: "./src/images",
          // for some reason, this doesn't seem to work for models,
          // so I'm leaving that directory out
          navigation: "./src/navigation",
          providers: "./src/providers",
          realmModels: "./src/realmModels",
          sharedHelpers: "./src/sharedHelpers",
          sharedHooks: "./src/sharedHooks",
          stores: "./src/stores",
          styles: "./src/styles",
          tests: "./tests",
          uploaders: "./src/uploaders",
        },
      }],
      // Reanimated 4: use worklets plugin (must be listed last). See migration 3.x -> 4.x.
      ["react-native-worklets/plugin", workletsPluginOptions],
    ],
    env: {
      production: {
        plugins: ["react-native-paper/babel", "transform-remove-console"],
      },
    },
  };
};
