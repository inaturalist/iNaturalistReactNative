// Makes className resolve to styles in jest the way it does in the app.
//
// In the app, importing global.css (transformed by metro) registers the core
// react-native components with nativewind's runtime and injects the compiled
// tailwind styles. In jest, global.css is mapped to an empty mock and the
// runtime skips component registration when NODE_ENV === "test", so both
// steps happen here instead. The compiled CSS comes from jest.globalSetup.js.
const fs = require( "fs" );
const path = require( "path" );

// react-native-css-interop is nativewind's own runtime dependency, which pins
// the compatible version
/* eslint-disable import/no-extraneous-dependencies */
// Registers View, Text, TextInput, etc. with the interop runtime
require( "react-native-css-interop/dist/runtime/components" );

const {
  cssToReactNativeRuntime,
} = require( "react-native-css-interop/dist/css-to-rn" );
const {
  injectData,
} = require( "react-native-css-interop/dist/runtime/native/styles" );
/* eslint-enable import/no-extraneous-dependencies */

const css = fs.readFileSync( path.join( __dirname, ".cache", "nativewind.css" ) );

// inlineRem must match the withNativeWind options in metro.config.js
injectData( cssToReactNativeRuntime( css, { inlineRem: 16 } ) );
