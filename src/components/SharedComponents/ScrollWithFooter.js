// @flow strict-local

import * as React from "react";
import {
  SafeAreaView, StatusBar, ScrollView, Keyboard
} from "react-native";

import viewStyles from "../../styles/sharedComponents/viewWithFooter";
import Footer from "./Footer";

type Props = {
  children: React.Node,
  testID?: string
}

const ScrollWithFooter = ( { children, testID }: Props ): React.Node => {
  const dismissKeyboard = ( ) => Keyboard.dismiss( );

  return (
    <SafeAreaView style={viewStyles.safeAreaContainer} testID={testID}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={viewStyles.scrollPadding}
        keyboardDismissMode="on-drag"
        onScroll={dismissKeyboard}
        scrollEventThrottle={16}
      >
        {children}
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
};

export default ScrollWithFooter;
