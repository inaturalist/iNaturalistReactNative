// @flow

import { Platform } from "react-native";
import colors from "styles/tailwindColors";

const showHeader: Object = {
  headerShown: true,
  headerBackTitleVisible: false,
  headerShadowVisible: false,
  headerTintColor: colors.black,
  // Note: left header is not supported on iOS
  // so we would need to build a custom header for this:
  // https://reactnavigation.org/docs/native-stack-navigator#headertitlealign
  headerTitleStyle: {
    fontSize: 24,
    fontFamily: Platform.OS === "ios" ? "Whitney-Medium" : "Whitney-Medium-Pro"
  }
};

const hideHeader = {
  headerShown: false
};

const hideScreenTransitionAnimation = {
  animation: "none"
};

const blankHeaderTitle = {
  headerTitle: ""
};

export {
  blankHeaderTitle,
  hideHeader,
  hideScreenTransitionAnimation,
  showHeader
};
