/**
 * Metro configuration for React Native
 * https://reactnative.dev/docs/metro
 * with added config for react-native-svg-transformer
 * https://www.npmjs.com/package/react-native-svg-transformer?activeTab
 *
 * @format
 */
// eslint-disable-next-line import/no-unresolved
const { getDefaultConfig, mergeConfig } = require( "@react-native/metro-config" );

const {
  resolver: { sourceExts, assetExts }
} = getDefaultConfig();

const localPackagePaths = [
  // If you reference any local paths in package.json, you'll need to list them here
];

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve( "react-native-svg-transformer" )
  },
  resolver: {
    assetExts: assetExts.filter( ext => ext !== "svg" ),
    sourceExts:
      process.env.MOCK_MODE === "e2e"
        ? ["e2e-mock", ...sourceExts, "svg"]
        : [...sourceExts, "svg"],
    nodeModulesPaths: [...localPackagePaths]
  },
  watchFolders: [...localPackagePaths]
};

module.exports = mergeConfig( getDefaultConfig( __dirname ), config );
