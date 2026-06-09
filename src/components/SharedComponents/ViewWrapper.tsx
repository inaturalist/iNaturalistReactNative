import classnames from "classnames";
import { SafeAreaView, View } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import * as React from "react";
import { StatusBar } from "react-native";

interface ScreenShellProps extends PropsWithChildren {
  testID?: string;
  wrapperClassName?: string;
}

const ScreenShell = ( {
  children,
  testID,
  wrapperClassName,
}: ScreenShellProps ) => (
  <View
    className={classnames(
      "flex-1",
      "bg-white",
      wrapperClassName,
    )}
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
}: ScreenShellProps ) => (
  <ScreenShell testID={testID} wrapperClassName={wrapperClassName}>
    <SafeAreaView className="flex-1" edges={["top"]}>
      {children}
    </SafeAreaView>
  </ScreenShell>
);

const BottomInsetViewWrapper = ( {
  children,
  testID,
  wrapperClassName,
}: ScreenShellProps ) => (
  <ScreenShell
    testID={testID}
    wrapperClassName={wrapperClassName}
  >
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      {children}
    </SafeAreaView>
  </ScreenShell>
);

export default ViewWrapper;

export { BottomInsetViewWrapper, ScreenShell };
