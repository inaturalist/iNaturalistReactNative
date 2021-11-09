// @flow strict-local

import * as React from "react";
import { SafeAreaView } from "react-native";

import viewStyles from "../../styles/sharedComponents/viewWithFooter";
import Footer from "./Footer";

type Props = {
  children: React.Node
}

const ViewWithFooter = ( { children }: Props ): React.Node => (
  <SafeAreaView style={viewStyles.safeAreaContainer}>
    {children}
    <Footer />
  </SafeAreaView>
);

export default ViewWithFooter;
