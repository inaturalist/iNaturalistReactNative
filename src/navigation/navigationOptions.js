// @flow
import React from "react";
import { Platform } from "react-native";
import colors from "styles/tailwindColors";

import BackButton from "./BackButton";
import ContextHeader from "./ContextHeader";

const baseHeaderOptions: Object = {
  headerShown: true,
  headerBackTitleVisible: false,
  headerShadowVisible: false
};

const showHeader: Object = {
  ...baseHeaderOptions,
  headerTintColor: colors.black,
  // Note: left header is not supported on iOS
  // so we would need to build a custom header for this:
  // https://reactnavigation.org/docs/native-stack-navigator#headertitlealign
  headerTitleStyle: {
    fontSize: 24,
    fontFamily: Platform.OS === "ios"
      ? "Whitney-Medium"
      : "Whitney-Medium-Pro"
  }
};

const showLongHeader: Object = {
  ...baseHeaderOptions,
  headerTintColor: colors.black,
  // Note: left header is not supported on iOS
  // so we would need to build a custom header for this:
  // https://reactnavigation.org/docs/native-stack-navigator#headertitlealign
  headerTitleStyle: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios"
      ? "Whitney-Medium"
      : "Whitney-Medium-Pro"
  }
};

export const showHeaderLeft: Object = {
  ...showHeader,
  headerLeft: ( ) => <BackButton />
};

export const showHeaderLeftWhite: Object = {
  ...showHeader,
  headerLeft: ( ) => <BackButton color={colors.white} />
};

export const hideHeaderLeft: Object = {
  ...showHeader,
  headerLeft: null
};

const showCustomHeader: Object = {
  ...baseHeaderOptions,
  header: ContextHeader
};

const hideHeader = {
  headerShown: false
};

const blankHeaderTitle = {
  headerTitle: ""
};

export {
  blankHeaderTitle,
  hideHeader,
  showCustomHeader,
  showHeader,
  showLongHeader
};
