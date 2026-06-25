import MyObservationsStackNavigator
  from "navigation/StackNavigators/MyObservationsStackNavigator";
import { MyObservationsProvider } from "providers/MyObservationsContext";
import React from "react";

const MyObservationsContainer = ( ) => (
  <MyObservationsProvider>
    <MyObservationsStackNavigator />
  </MyObservationsProvider>
);

export default MyObservationsContainer;
