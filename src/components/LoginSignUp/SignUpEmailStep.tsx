import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import useOnboardingExitSheet from "components/Onboarding/useOnboardingExitSheet";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import Body1 from "components/SharedComponents/Typography/Body1";
import type { OnboardingStepParamList } from "navigation/types";
import React from "react";
import { Trans } from "react-i18next";
import { Pressable } from "react-native";

import SignUpEmailForm from "./SignUpEmailForm";
import SignUpStepLayout from "./SignUpStepLayout";

const TEST_ID = "Onboarding.signup_email";

const SignUpEmailStep = ( ) => {
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStepParamList>>( );
  const { stepId, logIn, signedIn } = useOnboardingFlow( );
  const { exitSheetElement, openExitSheet } = useOnboardingExitSheet( stepId );

  return (
    <>
      <SignUpStepLayout
        backgroundSource={require( "images/background/birger-strahl-ksiGE4hMiso-unsplash.jpg" )}
        footer={(
          <Pressable
            accessibilityRole="button"
            onPress={logIn}
            testID={`${TEST_ID}.logIn`}
          >
            <Trans
              className="underline"
              i18nKey="Already-have-an-account-Log-in"
              components={[
                <Body1 key="0" className="text-white" />,
                <Body1 key="1" className="text-white font-Lato-Bold" />,
              ]}
            />
          </Pressable>
        )}
        onClose={openExitSheet}
        testID={TEST_ID}
      >
        <SignUpEmailForm
          onAvailable={email => navigation.navigate( "signup_credentials", { email } )}
          onSignedIn={signedIn}
          testID={TEST_ID}
        />
      </SignUpStepLayout>
      {exitSheetElement}
    </>
  );
};

export default SignUpEmailStep;
