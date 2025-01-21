// @flow

import classnames from "classnames";
import { Body1 } from "components/SharedComponents";
import { SafeAreaView } from "components/styledComponents";
import * as React from "react";
import { StatusBar } from "react-native";

type Props = {
  children: React.Node,
  isDebug?: boolean,
  testID?: string,
  // If someone can explain to me why className doesn't work here, I'm all
  // ears ~~~kueda 20230815
  wrapperClassName?: string
};

const ViewWrapper = ( {
  children,
  isDebug,
  wrapperClassName,
  testID
}: Props ): React.Node => (
  <SafeAreaView
    className={classnames(
      "flex-1",
      "bg-white",
      wrapperClassName,
      isDebug
        ? "border-2 border-deepPink"
        : null
    )}
    testID={testID}
  >
    {isDebug && (
      // eslint-disable-next-line i18next/no-literal-string
      <Body1 className="bg-deepPink text-white absolute bottom-0 right-0 z-10">DEBUG</Body1>
    )}
    <StatusBar barStyle="dark-content" backgroundColor="white" />
    {children}
  </SafeAreaView>
);

export default ViewWrapper;
