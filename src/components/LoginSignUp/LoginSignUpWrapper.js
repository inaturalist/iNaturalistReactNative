// @flow

import classnames from "classnames";
import { ImageBackground, SafeAreaView } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from "react-native";

type Props = {
  backgroundSource: any,
  children: any,
  keyboardVerticalOffset?: number
}

const KEYBOARD_AVOIDING_VIEW_STYLE = {
  flex: 1,
  flexGrow: 1
};

const LoginSignupWrapper = ( {
  backgroundSource,
  children,
  keyboardVerticalOffset
}: Props ): Node => (
  <ImageBackground
    source={backgroundSource}
    className="h-full"
  >
    <SafeAreaView
      className={classnames(
        "w-full",
        "h-full",
        // In LoginStackNavigator we set `headerTransparent: true`, but this
        // makes content inside the SafeAreaView stay there in iOS but flow
        // up under the header area in Android. Barring a better solution,
        // this makes sure content stay below the header on Android
        Platform.OS === "android" && "pt-[60px]"
      )}
    >
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        keyboardVerticalOffset={keyboardVerticalOffset}
        behavior="padding"
        style={KEYBOARD_AVOIDING_VIEW_STYLE}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  </ImageBackground>
);

export default LoginSignupWrapper;
