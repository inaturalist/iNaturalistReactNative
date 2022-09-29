// @flow

import * as React from "react";
import { StatusBar } from "react-native";

import { SafeAreaView } from "../styledComponents";

type Props = {
  children: React.Node,
  testID?: string,
  style?: Object
}

const ViewNoFooter = ( { children, testID, style }: Props ): React.Node => (
  <SafeAreaView className="flex-1 bg-white" style={style} testID={testID}>
    <StatusBar barStyle="dark-content" />
    {children}
  </SafeAreaView>
);

export default ViewNoFooter;
