// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ForgotPassword from "components/LoginSignUp/ForgotPassword";
import LicensePhotos from "components/LoginSignUp/LicensePhotos";
import Login from "components/LoginSignUp/Login";
import SignUp from "components/LoginSignUp/SignUp";
import SignUpConfirmation from "components/LoginSignUp/SignUpConfirmation";
import Mortal from "components/SharedComponents/Mortal";
import {
  hideHeader
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";

const Stack = createNativeStackNavigator( );

// The login component should be not preserve its state or effects after the
// user navigates away from it. This will simply cause it to unmount when it
// loses focus
const MortalLogin = ( ) => (
  <Mortal>
    <Login />
  </Mortal>
);

const LoginStackNavigator = ( ): Node => (
  <Stack.Navigator
    screenOptions={{
      contentStyle: {
        backgroundColor: "black"
      }
    }}
  >
    <Stack.Group>
      <Stack.Screen name="Login" component={MortalLogin} options={hideHeader} />
      <Stack.Screen name="SignUp" component={SignUp} options={hideHeader} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={hideHeader} />
      <Stack.Screen name="LicensePhotos" component={LicensePhotos} options={hideHeader} />
      <Stack.Screen name="SignUpConfirmation" component={SignUpConfirmation} options={hideHeader} />
    </Stack.Group>
  </Stack.Navigator>
);

export default LoginStackNavigator;
