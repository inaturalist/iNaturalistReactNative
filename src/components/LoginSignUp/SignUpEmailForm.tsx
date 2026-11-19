import type { ParamListBase } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Button from "components/SharedComponents/Buttons/Button";
import Body1 from "components/SharedComponents/Typography/Body1";
import Heading1 from "components/SharedComponents/Typography/Heading1";
import { View } from "components/styledComponents";
import React, { useEffect, useRef, useState } from "react";
import type { TextInput } from "react-native";
import useTranslation from "sharedHooks/useTranslation";

import checkEmailAvailability from "./checkEmailAvailability";
import Error from "./Error";
import LoginSignUpInputField from "./LoginSignUpInputField";
import ThirdPartySignInButtons from "./ThirdPartySignInButtons";

interface Props {
  // Called with the trimmed email once it's been checked as available for a
  // new account, if the screen is still focused
  onAvailable: ( email: string ) => void;
  onSignedIn: ( ) => void;
  // Prefixes the email field's and Continue button's testIDs
  testID: string;
}

// Starting an account with an email, Apple or Google. Where the user goes
// next is up to the screen hosting the form.
const SignUpEmailForm = ( { onAvailable, onSignedIn, testID }: Props ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>( );
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
    setError( null );
    setChecking( true );
    const availability = await checkEmailAvailability( trimmedEmail );
    setChecking( false );
    if ( availability === "available" ) {
      if ( !navigation.isFocused( ) ) return;
      onAvailable( trimmedEmail );
    } else if ( availability === "taken" ) {
      setError( t( "That-email-is-already-associated-with-an-account" ) );
    } else {
      setError( t( "Connection-problem-Please-try-again-later" ) );
    }
  };

  return (
    <>
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
          onSubmitEditing={( ) => {
            if ( trimmedEmail && !busy ) continueWithEmail( );
          }}
          returnKeyType="go"
          testID={`${testID}.email`}
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
        testID={`${testID}.next`}
        text={t( "CONTINUE" )}
      />
      <View className="mt-[39px]">
        <ThirdPartySignInButtons
          disabled={busy}
          onBusyChange={setSigningIn}
          onSignedIn={onSignedIn}
        />
      </View>
    </>
  );
};

export default SignUpEmailForm;
