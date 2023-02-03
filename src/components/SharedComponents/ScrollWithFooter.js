// @flow

import { SafeAreaView, ScrollView, View } from "components/styledComponents";
import * as React from "react";
import {
  Keyboard, StatusBar
} from "react-native";

import NavBar from "./NavBar/NavBar";

type Props = {
  children: React.Node,
  testID?: string,
  style?: Object
}

const ScrollWithFooter = ( { children, testID, style }: Props ): React.Node => {
  const dismissKeyboard = ( ) => Keyboard.dismiss( );

  return (
    <SafeAreaView className="flex-1 bg-white" style={style} testID={testID}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        keyboardDismissMode="on-drag"
        onScroll={dismissKeyboard}
        scrollEventThrottle={16}
      >
        {children}
        <View className="pb-64" />
      </ScrollView>
      <NavBar />
    </SafeAreaView>
  );
};

export default ScrollWithFooter;
