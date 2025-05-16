// @flow
import { HeaderBackground } from "@react-navigation/elements";
import { fontMedium } from "appConstants/fontFamilies.ts";
import FullPageWebViewHeader from "components/FullPageWebView/FullPageWebViewHeader.tsx";
import BackButton from "components/SharedComponents/Buttons/BackButton";
import type { Node } from "react";
import React from "react";
import { View } from "react-native";
import colors from "styles/tailwindColors";

import FadeInView from "./FadeInView";

// $FlowIgnore
const fadeInComponent = ( component: React.JSX.Element ): React.JSX.Element => (
  <FadeInView>
    {component}
  </FadeInView>
);

const baseHeaderOptions: Object = {
  headerShown: true,
  headerBackButtonDisplayMode: "minimal",
  headerShadowVisible: false,
  headerLeft: () => <BackButton inCustomHeader testID="header-back-button" />
};

const showHeader: Object = {
  ...baseHeaderOptions,
  headerTintColor: colors.darkGray,
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
  headerTintColor: colors.darkGray,
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

const preventSwipeToGoBack = {
  gestureEnabled: false
};

export {
  blankHeaderTitle,
  fadeInComponent,
  hideDrawerHeaderLeft,
  hideHeader,
  preventSwipeToGoBack,
  removeBottomBorder,
  showHeader,
  showLongHeader,
  showSimpleCustomHeader
};
