// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FullPageWebView from "components/FullPageWebView/FullPageWebView.tsx";
import ForgotPassword from "components/LoginSignUp/ForgotPassword";
import LearnMore from "components/LoginSignUp/LearnMore.tsx";
import Login from "components/LoginSignUp/Login.tsx";
import SignUp from "components/LoginSignUp/SignUp.tsx";
import SignUpConfirmation from "components/LoginSignUp/SignUpConfirmation.tsx";
import { CloseButton } from "components/SharedComponents";
import {
  hideHeaderLeft,
  showSimpleCustomHeader
} from "navigation/navigationOptions.tsx";
import type { Node } from "react";
import React from "react";

const Stack = createNativeStackNavigator( );

const LoginCloseButton = ( ) => (
  <CloseButton
    handleClose={navigation => navigation.getParent( )?.goBack( )}
    buttonClassName="mr-[-5px]"
  />
);

const LOGIN_SCREEN_OPTIONS = {
  headerTitle: "",
  headerTransparent: true,
  headerTintColor: "white",
  contentStyle: {
    backgroundColor: "black"
  }
};

const LoginStackNavigator = ( ): Node => (
  <Stack.Navigator>
    <Stack.Screen
      name="Login"
      component={Login}
      options={{
        ...LOGIN_SCREEN_OPTIONS,
        headerRight: LoginCloseButton,
        ...hideHeaderLeft
      }}
    />
    <Stack.Screen
      name="SignUp"
      component={SignUp}
      options={LOGIN_SCREEN_OPTIONS}
    />
    <Stack.Screen
      name="ForgotPassword"
      component={ForgotPassword}
      options={LOGIN_SCREEN_OPTIONS}
    />
    <Stack.Screen
      name="LearnMore"
      component={LearnMore}
      options={LOGIN_SCREEN_OPTIONS}
    />
    <Stack.Screen
      name="SignUpConfirmation"
      component={SignUpConfirmation}
      options={LOGIN_SCREEN_OPTIONS}
    />
    <Stack.Screen
      name="FullPageWebView"
      component={FullPageWebView}
      options={showSimpleCustomHeader}
    />
  </Stack.Navigator>
);

export default LoginStackNavigator;
