import classnames from "classnames";
import { SafeAreaView, View } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import * as React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props extends PropsWithChildren {
  testID?: string;
  wrapperClassName?: string;
  useTopInset?: boolean;
}

interface ScreenShellProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  testID?: string;
  wrapperClassName?: string;
}

const ScreenShell = ( {
  children,
  style,
  testID,
  wrapperClassName,
}: ScreenShellProps ) => (
  <View
    className={classnames(
      "flex-1",
      "bg-white",
      wrapperClassName,
    )}
    style={style}
    testID={testID}
  >
    <StatusBar barStyle="dark-content" />
    {children}
  </View>
);

const ViewWrapper = ( {
  children,
  wrapperClassName,
  testID,
  useTopInset = true,
}: Props ) => {
  const insets = useSafeAreaInsets();
  const viewStyle = {
    paddingTop: useTopInset
      ? insets.top
      : 0,
  };

  return (
    <ScreenShell
      style={viewStyle}
      testID={testID}
      wrapperClassName={wrapperClassName}
    >
      {children}
    </ScreenShell>
  );
};

const BottomInsetViewWrapper = ( {
  children,
  style,
  testID,
  wrapperClassName,
}: ScreenShellProps ) => (
  <ScreenShell
    testID={testID}
    style={style}
    wrapperClassName={wrapperClassName}
  >
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      {children}
    </SafeAreaView>
  </ScreenShell>
);

export default ViewWrapper;

export { BottomInsetViewWrapper, ScreenShell };
