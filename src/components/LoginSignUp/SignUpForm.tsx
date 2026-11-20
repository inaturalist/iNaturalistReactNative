import { useNavigation } from "@react-navigation/native";
import { Button } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React, { useEffect, useRef, useState } from "react";
import type { TextInput } from "react-native";
import { TouchableWithoutFeedback } from "react-native";

import checkEmailAvailability from "./checkEmailAvailability";
import Error from "./Error";
import isValidEmail from "./isValidEmail";
import LoginSignUpInputField from "./LoginSignUpInputField";

const SignUpForm = ( ) => {
  const navigation = useNavigation( );
  const emailRef = useRef<TextInput>( null );
  const [email, setEmail] = useState( "" );
  const [isLoading, setIsLoading] = useState( false );
  const [error, setError] = useState<string>( );

  const blurFields = () => {
    if ( emailRef.current ) {
      emailRef.current.blur();
    }
  };

  useEffect( () => {
    const unsubscribeBlur = navigation.addListener( "blur", blurFields );

    return unsubscribeBlur;
  }, [navigation] );

  useEffect( () => {
    const unsubscrubeTransition = navigation.addListener( "transitionEnd", blurFields );

    return unsubscrubeTransition;
  }, [navigation] );

  const onContinue = async ( ) => {
    const trimmedEmail = email.trim( );
    if ( !isValidEmail( trimmedEmail ) ) {
      setError( t( "Please-enter-a-valid-email-address" ) );
      return;
    }
    setError( undefined );
    setIsLoading( true );
    const availability = await checkEmailAvailability( trimmedEmail );
    setIsLoading( false );
    if ( availability === "available" ) {
      navigation.navigate( "SignUpConfirmation", {
        user: {
          email: trimmedEmail,
        },
      } );
    } else if ( availability === "taken" ) {
      setError( t( "That-email-is-already-associated-with-an-account" ) );
    } else {
      setError( t( "Connection-problem-Please-try-again-later" ) );
    }
  };

  return (
    <TouchableWithoutFeedback accessible={false} onPress={blurFields}>
      <View className="px-4 mt-[9px] justify-end">
        <LoginSignUpInputField
          ref={emailRef}
          accessibilityLabel={t( "EMAIL" )}
          autoComplete="email"
          headerText={t( "EMAIL" )}
          inputMode="email"
          keyboardType="email-address"
          onChangeText={( text: string ) => {
            setEmail( text );
            setError( undefined );
          }}
          testID="Signup.email"
          textContentType="emailAddress"
        />
        {error && <Error error={error} />}
        <Button
          className="mt-[30px] mb-[35px]"
          disabled={!email || isLoading}
          level="focus"
          forceDark
          onPress={( ) => onContinue( )}
          testID="Signup.signupButton"
          text={t( "CONTINUE" )}
          loading={isLoading}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignUpForm;
