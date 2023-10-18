// @flow

import { ImageBackground, SafeAreaView } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform
} from "react-native";

type Props = {
  backgroundSource: any,
  children: any
}

const KEYBOARD_AVOIDING_VIEW_STYLE = { flex: 1 };

const LoginSignupWrapper = ( { backgroundSource, children }: Props ): Node => (
  <SafeAreaView className="bg-black w-full h-full">
    <ImageBackground
      source={backgroundSource}
      className="h-full"
    >
      <KeyboardAvoidingView
        keyboardVerticalOffset={30}
        behavior={
          Platform.OS === "android"
            ? "height"
            : "padding"
        }
        style={KEYBOARD_AVOIDING_VIEW_STYLE}
      >
        {children}
      </KeyboardAvoidingView>
    </ImageBackground>
  </SafeAreaView>
);

export default LoginSignupWrapper;
