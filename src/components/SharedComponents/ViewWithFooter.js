// @flow strict-local

import { SafeAreaView } from "components/styledComponents";
import * as React from "react";
import { StatusBar } from "react-native";

import Footer from "./Footer";

type Props = {
  children: React.Node,
  testID?: string
}

const ViewWithFooter = ( { children, testID }: Props ): React.Node => (
  <SafeAreaView className="flex-1 bg-white" testID={testID}>
    <StatusBar barStyle="dark-content" />
    {children}
    <Footer />
  </SafeAreaView>
);

export default ViewWithFooter;
