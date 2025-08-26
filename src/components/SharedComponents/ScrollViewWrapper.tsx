import { SafeAreaView, ScrollView } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import * as React from "react";
import type { ViewStyle } from "react-native";
import { Keyboard, StatusBar } from "react-native";

interface Props extends PropsWithChildren {
  testID?: string;
  style?: ViewStyle;
  scrollRef?: object;
}

const CONTENT_CONTAINER_STYLE = {
  display: "flex",
  minHeight: "100%"
} as const;

const ScrollViewWrapper = ( {
  children,
  testID,
  style,
  scrollRef
}: Props ) => {
  const dismissKeyboard = () => Keyboard.dismiss();

  return (
    <SafeAreaView className="flex-1 bg-white" style={style} testID={testID}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ScrollView
        ref={scrollRef}
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
