// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FullPageWebView from "components/FullPageWebView/FullPageWebView";
import ForgotPassword from "components/LoginSignUp/ForgotPassword";
import LearnMore from "components/LoginSignUp/LearnMore";
import Login from "components/LoginSignUp/Login";
import SignUp from "components/LoginSignUp/SignUp";
import SignUpConfirmation from "components/LoginSignUp/SignUpConfirmation";
import { CloseButton } from "components/SharedComponents";
import BackButton from "components/SharedComponents/Buttons/BackButton";
import {
  hideHeaderLeft,
  showSimpleCustomHeader,
} from "navigation/navigationOptions";
import type { LoginStackParamList } from "navigation/types";
import React from "react";
import colors from "styles/tailwindColors";

const Stack = createNativeStackNavigator<LoginStackParamList>( );

const LoginCloseButton = ( ) => (
  <CloseButton
    handleClose={navigation => navigation.getParent( )?.goBack( )}
    buttonClassName="mr-[-5px]"
  />
);

const LearnMoreBackButton = ( ) => <BackButton color={colors.white} inCustomHeader />;

const LOGIN_SCREEN_OPTIONS = {
  headerTitle: "",
  headerTransparent: true,
  headerTintColor: "white",
  contentStyle: {
    backgroundColor: "black",
  },
} as const;

const LoginStackNavigator = ( ) => (
  <Stack.Navigator>
    <Stack.Screen
      name="Login"
      component={Login}
      options={{
        ...LOGIN_SCREEN_OPTIONS,
        headerRight: LoginCloseButton,
        ...hideHeaderLeft,
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
      // Opened directly from onboarding sign-up, it's this stack's first
      // screen, so there's no native back button
      options={( { navigation } ) => ( navigation.getState( ).index === 0
        ? { ...LOGIN_SCREEN_OPTIONS, headerLeft: LearnMoreBackButton }
        : LOGIN_SCREEN_OPTIONS )}
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
