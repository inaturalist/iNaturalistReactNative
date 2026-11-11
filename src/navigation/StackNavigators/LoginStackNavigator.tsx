// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FullPageWebView from "components/FullPageWebView/FullPageWebView";
import ForgotPassword from "components/LoginSignUp/ForgotPassword";
import LearnMore from "components/LoginSignUp/LearnMore";
import Login from "components/LoginSignUp/Login";
import SignUp from "components/LoginSignUp/SignUp";
import SignUpConfirmation from "components/LoginSignUp/SignUpConfirmation";
import SignUpCredentialsStep from "components/LoginSignUp/SignUpCredentialsStep";
import SignUpEmailStep from "components/LoginSignUp/SignUpEmailStep";
import type { OnboardingFlowHost } from "components/Onboarding/OnboardingFlowContext";
import { OnboardingFlowProvider } from "components/Onboarding/OnboardingFlowContext";
import useAfterSignIn from "components/Onboarding/useAfterSignIn";
import { CloseButton } from "components/SharedComponents";
import {
  hideHeader,
  hideHeaderLeft,
  showSimpleCustomHeader,
} from "navigation/navigationOptions";
import type { LoginStackParamList, RootStackScreenProps } from "navigation/types";
import React, { useMemo } from "react";
import useFeatureFlag from "sharedHooks/useFeatureFlag";
import { FeatureFlag } from "stores/createFeatureFlagSlice";

const Stack = createNativeStackNavigator<LoginStackParamList>( );

const SIGN_UP_STEPS = ["signup_email", "signup_credentials"] as const;

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

const LoginStackNavigator = ( { navigation }: RootStackScreenProps ) => {
  const onboardingV2Enabled = useFeatureFlag( FeatureFlag.OnboardingV2Enabled );
  const afterSignIn = useAfterSignIn( );

  // Sign-up opened from Login: exiting or choosing to log in returns to Login
  const signUpFromLoginHost = useMemo<OnboardingFlowHost>( ( ) => {
    const returnToLogin = ( ) => {
      navigation.navigate( "LoginStackNavigator", { screen: "Login", pop: true } );
    };
    return {
      steps: SIGN_UP_STEPS,
      onFinish: ( ) => afterSignIn( navigation, ( ) => {
        navigation.navigate( "TabNavigator", {
          screen: "ObservationsTab",
          params: {
            initialRouteName: "ObsList",
            screen: "ObsList",
          },
        }, { pop: true } );
      } ),
      onExit: returnToLogin,
      onLogIn: returnToLogin,
    };
  }, [afterSignIn, navigation] );

  return (
    <OnboardingFlowProvider value={signUpFromLoginHost}>
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
        {onboardingV2Enabled && (
          <Stack.Group screenOptions={hideHeader}>
            <Stack.Screen
              name="signup_email"
              component={SignUpEmailStep}
            />
            <Stack.Screen
              name="signup_credentials"
              component={SignUpCredentialsStep}
            />
          </Stack.Group>
        )}
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
    </OnboardingFlowProvider>
  );
};

export default LoginStackNavigator;
