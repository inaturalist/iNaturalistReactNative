import classnames from "classnames";
import { View } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import * as React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props extends PropsWithChildren {
  testID?: string;
  wrapperClassName?: string;
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
}: Props ) => {
  const insets = useSafeAreaInsets();
  const viewStyle = {
    paddingTop: insets.top,
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
  testID,
  wrapperClassName,
}: Props ) => {
  const insets = useSafeAreaInsets();
  const viewStyle = {
    paddingBottom: insets.bottom,
  };

  return (
    <ScreenShell
      testID={testID}
      style={viewStyle}
      wrapperClassName={wrapperClassName}
    >
      {children}
    </ScreenShell>
  );
};

const TopAndBottomInsetViewWrapper = ( {
  children,
  testID,
  wrapperClassName,
}: Props ) => {
  const insets = useSafeAreaInsets();
  const viewStyle = {
    paddingBottom: insets.bottom,
    paddingTop: insets.top,
  };

  return (
    <ScreenShell
      testID={testID}
      style={viewStyle}
      wrapperClassName={wrapperClassName}
    >
      {children}
    </ScreenShell>
  );
};

export default ViewWrapper;

export { BottomInsetViewWrapper, ScreenShell, TopAndBottomInsetViewWrapper };
