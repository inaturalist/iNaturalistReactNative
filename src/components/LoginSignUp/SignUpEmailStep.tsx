import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import Button from "components/SharedComponents/Buttons/Button";
import Body1 from "components/SharedComponents/Typography/Body1";
import Heading1 from "components/SharedComponents/Typography/Heading1";
import { View } from "components/styledComponents";
import type { OnboardingStepParamList } from "navigation/types";
import React, { useEffect, useRef, useState } from "react";
import { Trans } from "react-i18next";
import type { TextInput } from "react-native";
import { Pressable } from "react-native";
import useTranslation from "sharedHooks/useTranslation";

import checkEmailAvailability from "./checkEmailAvailability";
import Error from "./Error";
import LoginSignUpInputField from "./LoginSignUpInputField";
import SignUpStepLayout from "./SignUpStepLayout";
import ThirdPartySignInButtons from "./ThirdPartySignInButtons";

// Creating an account with an email, Apple or Google. The rest of email
// sign-up happens on the next step.
const SignUpEmailStep = ( ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStepParamList>>( );
  const {
    stepId, logIn, signedIn,
  } = useOnboardingFlow( );
  const emailRef = useRef<TextInput>( null );
  const [email, setEmail] = useState( "" );
  const [checking, setChecking] = useState( false );
  const [signingIn, setSigningIn] = useState( false );
  const [error, setError] = useState<string | null>( null );
  const trimmedEmail = email.trim( );
  const busy = checking || signingIn;

  useEffect( ( ) => {
    const blurEmail = ( ) => emailRef.current?.blur( );
    const unsubscribeBlur = navigation.addListener( "blur", blurEmail );
    const unsubscribeTransitionEnd = navigation.addListener( "transitionEnd", blurEmail );
    return ( ) => {
      unsubscribeBlur( );
      unsubscribeTransitionEnd( );
    };
  }, [navigation] );

  const onChangeEmail = ( text: string ) => {
    setEmail( text );
    setError( null );
  };

  const continueWithEmail = async ( ) => {
    setChecking( true );
    const availability = await checkEmailAvailability( trimmedEmail );
    setChecking( false );
    if ( availability === "available" ) {
      if ( !navigation.isFocused( ) ) return;
      navigation.navigate( "signup_credentials", { email: trimmedEmail } );
    } else if ( availability === "taken" ) {
      setError( t( "That-email-is-already-associated-with-an-account" ) );
    } else {
      setError( t( "Connection-problem-Please-try-again-later" ) );
    }
  };

  return (
    <SignUpStepLayout
      backgroundSource={require( "images/background/birger-strahl-ksiGE4hMiso-unsplash.jpg" )}
      footer={(
        <Pressable
          accessibilityRole="button"
          onPress={logIn}
          testID={`Onboarding.${stepId}.logIn`}
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
    >
      <Heading1 className="text-white">
        {t( "Lets-create-your-profile" )}
      </Heading1>
      <Body1 className="text-white mt-3">
        {t( "You-can-post-observations-and-other-naturalists-can-respond-to-what-you-find" )}
      </Body1>
      <View className="-mx-2 mt-[11px]">
        <LoginSignUpInputField
          ref={emailRef}
          accessibilityLabel={t( "EMAIL" )}
          autoComplete="email"
          editable={!checking}
          headerText={t( "EMAIL" )}
          inputMode="email"
          keyboardType="email-address"
          onChangeText={onChangeEmail}
          testID="Onboarding.signup_email.email"
          textContentType="emailAddress"
        />
      </View>
      {error && <Error error={error} />}
      <Button
        className={error
          ? "mt-3"
          : "mt-[30px]"}
        disabled={!trimmedEmail || busy}
        level="focus"
        forceDark
        loading={busy}
        onPress={continueWithEmail}
        testID={`Onboarding.${stepId}.next`}
        text={t( "CONTINUE" )}
      />
      <View className="mt-[39px]">
        <ThirdPartySignInButtons
          disabled={busy}
          onBusyChange={setSigningIn}
          onSignedIn={signedIn}
        />
      </View>
    </SignUpStepLayout>
  );
};

export default SignUpEmailStep;
