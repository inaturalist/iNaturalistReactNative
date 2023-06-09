// @flow

import { ImageBackground, SafeAreaView } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  backgroundSource: any,
  children: any
}

const LoginSignupWrapper = ( { backgroundSource, children }: Props ): Node => (
  <SafeAreaView className="bg-black w-full h-full">
    <ImageBackground
      source={backgroundSource}
      className="h-full"
    >
      {children}
    </ImageBackground>
  </SafeAreaView>
);

export default LoginSignupWrapper;
