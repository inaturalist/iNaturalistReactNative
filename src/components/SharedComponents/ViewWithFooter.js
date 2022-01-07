// @flow strict-local

import * as React from "react";
import { SafeAreaView, StatusBar } from "react-native";

import viewStyles from "../../styles/sharedComponents/viewWithFooter";
import Footer from "./Footer";

type Props = {
  children: React.Node
}

const ViewWithFooter = ( { children }: Props ): React.Node => (
  <SafeAreaView style={viewStyles.safeAreaContainer}>
    <StatusBar barStyle="dark-content" />
    {children}
    <Footer />
  </SafeAreaView>
);

export default ViewWithFooter;
