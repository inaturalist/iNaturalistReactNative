import classnames from "classnames";
import { Body1 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import * as React from "react";
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
    <View
      className={classnames(
        "flex-1",
        "bg-white",
        wrapperClassName,
        isDebug
          ? "border-2 border-deepPink"
          : null,
      )}
      style={viewStyle}
      testID={testID}
    >
      {isDebug && (
      // eslint-disable-next-line i18next/no-literal-string
        <Body1 className="bg-deepPink text-white absolute bottom-0 right-0 z-10">DEBUG</Body1>
      )}
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      {children}
    </View>
  );
};

export default ViewWrapper;
