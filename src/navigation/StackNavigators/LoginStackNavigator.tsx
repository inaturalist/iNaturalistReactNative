import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FullPageWebView from "components/FullPageWebView/FullPageWebView";
import ForgotPassword from "components/LoginSignUp/ForgotPassword";
import LearnMore from "components/LoginSignUp/LearnMore";
import Login from "components/LoginSignUp/Login";
import SignUp from "components/LoginSignUp/SignUp";
import SignUpConfirmation from "components/LoginSignUp/SignUpConfirmation";
import { BackButton, CloseButton } from "components/SharedComponents";
import {
  hideHeaderLeft,
  showSimpleCustomHeader,
} from "navigation/navigationOptions";
import type { LoginStackParamList } from "navigation/types";
import React from "react";

const Stack = createNativeStackNavigator<LoginStackParamList>( );

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
    backgroundColor: "black",
  },
} as const;

const LoginBackButton = ( ) => <BackButton color="white" inCustomHeader />;

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
      // iOS only shows its native back button when this stack has a screen
      // to go back to, so Learn More opened straight from onboarding needs
      // its own, which leaves the stack
      options={( { navigation, route } ) => (
        navigation.getState( ).routes[0]?.key === route.key
          ? { ...LOGIN_SCREEN_OPTIONS, headerLeft: LoginBackButton }
          : LOGIN_SCREEN_OPTIONS
      )}
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
