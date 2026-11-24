import { useNavigation, useRoute } from "@react-navigation/native";
import useOnboardingExitSheet from "components/Onboarding/useOnboardingExitSheet";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import type { OnboardingStackScreenProps } from "navigation/types";
import React, { useState } from "react";

import SignUpCredentialsForm from "./SignUpCredentialsForm";
import SignUpStepLayout from "./SignUpStepLayout";

const TEST_ID = "Onboarding.signup_credentials";

type ScreenProps = OnboardingStackScreenProps<"signup_credentials">;

const SignUpCredentialsStep = ( ) => {
  const navigation = useNavigation<ScreenProps["navigation"]>( );
  const { params } = useRoute<ScreenProps["route"]>( );
  const { stepId, signedIn } = useOnboardingFlow( );
  const { exitSheetElement, openExitSheet } = useOnboardingExitSheet( stepId );
  const [creatingAccount, setCreatingAccount] = useState( false );

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
        leavingDisabled={creatingAccount}
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
          onCreatingAccountChange={setCreatingAccount}
          testID={TEST_ID}
        />
      </SignUpStepLayout>
      {exitSheetElement}
    </>
  );
};

export default SignUpCredentialsStep;
