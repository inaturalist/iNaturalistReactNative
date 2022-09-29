module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    "react-native-reanimated/plugin",
    "transform-inline-environment-variables",
    ["module-resolver", {
      alias: {
        i18n: "./src/i18n",
        styles: "./src/styles"
      }
    }]],
  env: {
    production: {
      plugins: ["react-native-paper/babel"]
    }
  }
};
