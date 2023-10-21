import LoginStackNavigator from "navigation/StackNavigators/LoginStackNavigator";
import React from "react";
import { Portal } from "react-native-paper";

const LoginStackNavigatorWithPortal = props => (
  <Portal.Host>
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <LoginStackNavigator {...props} />
  </Portal.Host>
);

const ModalLoginScreen = ( { name = "ModalLoginScreen", navigator } ) => (
  <navigator.Screen
    name={name}
    component={LoginStackNavigatorWithPortal}
    options={{
      presentation: "modal",
      headerShown: false
    }}
  />
);

export default ModalLoginScreen;
