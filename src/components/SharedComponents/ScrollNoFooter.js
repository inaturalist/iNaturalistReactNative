// @flow

import * as React from "react";
import {
  Keyboard, SafeAreaView, ScrollView, StatusBar
} from "react-native";

import viewStyles from "../../styles/sharedComponents/viewWithFooter";

type Props = {
  children: React.Node,
  testID?: string,
  style?: Object
}

const ScrollWithFooter = ( { children, testID, style }: Props ): React.Node => {
  const dismissKeyboard = ( ) => Keyboard.dismiss( );

  return (
    <SafeAreaView style={[viewStyles.safeAreaContainer, style]} testID={testID}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={viewStyles.scrollPadding}
        keyboardDismissMode="on-drag"
        onScroll={dismissKeyboard}
        scrollEventThrottle={16}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScrollWithFooter;
