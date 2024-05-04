// @flow
import { HeaderBackground } from "@react-navigation/elements";
import { fontMedium } from "appConstants/fontFamilies.ts";
import FullPageWebViewHeader from "components/FullPageWebView/FullPageWebViewHeader";
import BackButton from "components/SharedComponents/Buttons/BackButton";
import type { Node } from "react";
import React from "react";
import { View } from "react-native";
import colors from "styles/tailwindColors";

import ContextHeader from "./ContextHeader";

const baseHeaderOptions: Object = {
  headerShown: true,
  headerBackTitleVisible: false,
  headerShadowVisible: false,
  headerLeft: () => <BackButton inCustomHeader />
};

const showHeader: Object = {
  ...baseHeaderOptions,
  headerTintColor: colors.black,
  // Note: left header is not supported on iOS
  // so we would need to build a custom header for this:
  // https://reactnavigation.org/docs/native-stack-navigator#headertitlealign
  headerTitleStyle: {
    fontSize: 24,
    fontFamily: fontMedium
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
    fontFamily: fontMedium
  }
};

export const hideHeaderLeft: Object = {
  ...showHeader,
  headerLeft: null,
  headerBackVisible: false
};

const showSimpleCustomHeader: Object = {
  header: FullPageWebViewHeader,
  headerShadowVisible: true
};

const showCustomHeader: Object = {
  ...baseHeaderOptions,
  header: ContextHeader,
  headerShadowVisible: true,
  alignStart: true,
  headerLeft: () => <BackButton inCustomHeader />
};

const hideHeader = {
  headerShown: false
};

const blankHeaderTitle = {
  headerTitle: ""
};

const removeBottomBorder = {
  headerBackground: ( ): Node => (
    // eslint-disable-next-line react-native/no-inline-styles
    <HeaderBackground style={{ bottomBorderColor: "white" }} />
  )
};

// this removes the default hamburger menu from header
const hideDrawerHeaderLeft = {
  headerLeft: ( ): Node => (
    <View />
  )
};

export {
  blankHeaderTitle,
  hideDrawerHeaderLeft,
  hideHeader,
  removeBottomBorder,
  showCustomHeader,
  showHeader,
  showLongHeader,
  showSimpleCustomHeader
};
