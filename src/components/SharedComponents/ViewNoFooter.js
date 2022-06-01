// @flow

import * as React from "react";
import { SafeAreaView, StatusBar } from "react-native";

import viewStyles from "../../styles/sharedComponents/viewWithFooter";

type Props = {
  children: React.Node,
  testID?: string,
  style?: Object
}

const ViewNoFooter = ( { children, testID, style }: Props ): React.Node => (
  <SafeAreaView style={[viewStyles.safeAreaContainer, style]} testID={testID}>
    <StatusBar barStyle="dark-content" />
    {children}
  </SafeAreaView>
);

export default ViewNoFooter;
