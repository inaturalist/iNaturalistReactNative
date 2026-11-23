import { useNavigation, useRoute } from "@react-navigation/native";
import useOnboardingExitSheet from "components/Onboarding/useOnboardingExitSheet";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import type { OnboardingStackScreenProps } from "navigation/types";
import React, { useEffect, useState } from "react";

import SignUpCredentialsForm from "./SignUpCredentialsForm";
import SignUpStepLayout from "./SignUpStepLayout";

const TEST_ID = "Onboarding.signup_credentials";
// Nothing times the requests out, so a stalled connection mustn't keep the
// user on the step for good
const MAX_LEAVING_LOCK_MS = 15_000;

type ScreenProps = OnboardingStackScreenProps<"signup_credentials">;

const SignUpCredentialsStep = ( ) => {
  const navigation = useNavigation<ScreenProps["navigation"]>( );
  const { params } = useRoute<ScreenProps["route"]>( );
  const { stepId, signedIn } = useOnboardingFlow( );
  const { exitSheetElement, openExitSheet } = useOnboardingExitSheet( stepId );
  const [submitting, setSubmitting] = useState( false );
  const [leavingLockExpired, setLeavingLockExpired] = useState( false );
  useEffect( ( ) => {
    const timer = submitting
      ? setTimeout( ( ) => setLeavingLockExpired( true ), MAX_LEAVING_LOCK_MS )
      : undefined;
    return ( ) => {
      clearTimeout( timer );
      setLeavingLockExpired( false );
    };
  }, [submitting] );

  // The account exists, so leave Login on top of the email step: closing
  // Login must not return to this form
  const logInOverEmailStep = ( ) => {
    if ( !navigation.isFocused( ) ) return;
    const rootNavigation = navigation.getParent( );
    navigation.popTo( "signup_email" );
    rootNavigation?.navigate( "LoginStackNavigator", {
      screen: "Login",
      params: { fromOnboarding: true },
    } );
  };

  return (
    <>
      <SignUpStepLayout
        backgroundSource={require( "images/background/plants.jpg" )}
        leavingDisabled={submitting && !leavingLockExpired}
        onClose={openExitSheet}
        testID={TEST_ID}
      >
        <SignUpCredentialsForm
          email={params.email}
          onLearnMore={( ) => navigation.navigate( "LoginStackNavigator", {
            screen: "LearnMore",
          } )}
          onSignedIn={signedIn}
          onSignInFailed={logInOverEmailStep}
          onSubmittingChange={setSubmitting}
          testID={TEST_ID}
        />
      </SignUpStepLayout>
      {exitSheetElement}
    </>
  );
};

export default SignUpCredentialsStep;
