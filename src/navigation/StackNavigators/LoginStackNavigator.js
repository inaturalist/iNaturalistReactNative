// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ForgotPassword from "components/LoginSignUp/ForgotPassword";
import LicensePhotos from "components/LoginSignUp/LicensePhotos";
import Login from "components/LoginSignUp/Login";
import SignUp from "components/LoginSignUp/SignUp";
import SignUpConfirmation from "components/LoginSignUp/SignUpConfirmation";
import { CloseButton } from "components/SharedComponents";
import {
  hideHeaderLeft
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";

const Stack = createNativeStackNavigator( );

const LoginCloseButton = ( ) => (
  <CloseButton
    handleClose={navigation => navigation.getParent( )?.goBack( )}
    buttonClassName="mr-[-15px]"
  />
);

const LOGIN_SCREEN_OPTIONS = {
  headerTitle: "",
  headerTransparent: true,
  headerTintColor: "white",
  contentStyle: {
    backgroundColor: "black"
  },
  headerRight: LoginCloseButton
};

const LoginStackNavigator = ( ): Node => (
  <Stack.Navigator
    screenOptions={LOGIN_SCREEN_OPTIONS}
  >
    <Stack.Screen
      name="Login"
      component={Login}
      options={{
        ...hideHeaderLeft
      }}
    />
    <Stack.Screen
      name="SignUp"
      component={SignUp}
    />
    <Stack.Screen
      name="ForgotPassword"
      component={ForgotPassword}
    />
    <Stack.Screen
      name="LicensePhotos"
      component={LicensePhotos}
    />
    <Stack.Screen
      name="SignUpConfirmation"
      component={SignUpConfirmation}
    />
  </Stack.Navigator>
);

export default LoginStackNavigator;
