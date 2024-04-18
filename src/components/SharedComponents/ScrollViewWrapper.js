// @flow

import { SafeAreaView, ScrollView } from "components/styledComponents";
import * as React from "react";
import { Keyboard, StatusBar } from "react-native";

type Props = {
  children: React.Node,
  testID?: string,
  style?: any
};

const CONTENT_CONTAINER_STYLE = {
  display: "flex",
  minHeight: "100%"
};

const ScrollViewWrapper = ( {
  children,
  testID,
  style
}: Props ): React.Node => {
  const dismissKeyboard = () => Keyboard.dismiss();

  return (
    <SafeAreaView className="flex-1 bg-white" style={style} testID={testID}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ScrollView
        keyboardDismissMode="on-drag"
        onScroll={dismissKeyboard}
        scrollEventThrottle={16}
        contentContainerStyle={CONTENT_CONTAINER_STYLE}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScrollViewWrapper;
