import classnames from "classnames";
import { Body1 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import * as React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props extends PropsWithChildren {
  isDebug?: boolean;
  testID?: string;
  // If someone can explain to me why className doesn't work here, I'm all
  // ears ~~~kueda 20230815
  wrapperClassName?: string;
  useTopInset?: boolean;
}

interface ScreenShellProps extends PropsWithChildren {
  isDebug?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  wrapperClassName?: string;
}

const ScreenShell = ( {
  children,
  isDebug,
  style,
  testID,
  wrapperClassName,
}: ScreenShellProps ) => (
  <View
    className={classnames(
      "flex-1",
      "bg-white",
      wrapperClassName,
      isDebug
        ? "border-2 border-deepPink"
        : null,
    )}
    style={style}
    testID={testID}
  >
    {isDebug && (
    // eslint-disable-next-line i18next/no-literal-string
      <Body1 className="bg-deepPink text-white absolute bottom-0 right-0 z-10">DEBUG</Body1>
    )}
    <StatusBar barStyle="dark-content" />
    {children}
  </View>
);

const ViewWrapper = ( {
  children,
  isDebug,
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
      isDebug={isDebug}
      style={viewStyle}
      testID={testID}
      wrapperClassName={wrapperClassName}
    >
      {children}
    </ScreenShell>
  );
};

export default ViewWrapper;
