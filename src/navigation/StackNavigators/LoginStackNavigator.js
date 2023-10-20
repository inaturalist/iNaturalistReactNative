import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ForgotPassword from "components/LoginSignUp/ForgotPassword";
import LicensePhotos from "components/LoginSignUp/LicensePhotos";
import Login from "components/LoginSignUp/Login";
import SignUp from "components/LoginSignUp/SignUp";
import SignUpConfirmation from "components/LoginSignUp/SignUpConfirmation";
import { BackButton } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";

const LOGIN_SCREEN_OPTIONS = {
  headerTitle: "",
  headerTransparent: true,
  headerTintColor: "white",
  contentStyle: {
    backgroundColor: "black"
  }
};

const Stack = createNativeStackNavigator( );

const LoginBackButton = () => <BackButton color="white" />;

const LoginStackNavigator = ( ): Node => (
  <Stack.Navigator>
    <Stack.Screen
      name="Login"
      component={Login}
      options={{
        ...LOGIN_SCREEN_OPTIONS,
        headerLeft: LoginBackButton
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
      name="LicensePhotos"
      component={LicensePhotos}
      options={LOGIN_SCREEN_OPTIONS}
    />
    <Stack.Screen
      name="SignUpConfirmation"
      component={SignUpConfirmation}
      options={LOGIN_SCREEN_OPTIONS}
    />
  </Stack.Navigator>
);

export default LoginStackNavigator;
