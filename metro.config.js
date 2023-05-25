/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 * with added config for react-native-svg-transformer
 * https://www.npmjs.com/package/react-native-svg-transformer?activeTab
 *
 * @format
 */

const { getDefaultConfig } = require( "metro-config" );

module.exports = ( async () => {
  const {
    resolver: { sourceExts, assetExts }
  } = await getDefaultConfig();
  return {
    transformer: {
      getTransformOptions: async () => ( {
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true
        }
      } ),
      babelTransformerPath: require.resolve( "react-native-svg-transformer" )
    },
    resolver: {
      assetExts: assetExts.filter( ext => ext !== "svg" ),
      sourceExts:
        process.env.MOCK_MODE === "e2e"
          ? ["e2e-mock.js", ...sourceExts, "svg"]
          : [...sourceExts, "svg"]
    }
  };
} )();
