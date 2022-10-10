module.exports = {
  dependencies: {
    "react-native-config": {
      platforms: {
        android: null // disable Android platform, other platforms will still autolink if provided
      }
    },
    "react-native-vector-icons": {
      platforms: {
        ios: null
      }
    }
  },
  assets:["./assets/fonts/"]
};
