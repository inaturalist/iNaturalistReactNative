// @flow

import { ImageBackground, SafeAreaView } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import {
  KeyboardAvoidingView,
  StatusBar
} from "react-native";

type Props = {
  backgroundSource: any,
  children: any
}

const KEYBOARD_AVOIDING_VIEW_STYLE = {
  flex: 1,
  flexGrow: 1
};

const LoginSignupWrapper = ( { backgroundSource, children }: Props ): Node => (
  <ImageBackground
    source={backgroundSource}
    className="h-full"
  >
    <SafeAreaView className="w-full h-full">
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        keyboardVerticalOffset={30}
        behavior="padding"
        style={KEYBOARD_AVOIDING_VIEW_STYLE}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  </ImageBackground>
);

export default LoginSignupWrapper;
