module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    "nativewind/babel",
    "react-native-reanimated/plugin",
    "transform-inline-environment-variables"
  ],
  env: {
    production: {
      plugins: ["react-native-paper/babel"]
    }
  }
};
