import { useNavigation } from "@react-navigation/native";
import { Button } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React, { useEffect, useRef, useState } from "react";
import { TextInput, TouchableWithoutFeedback } from "react-native";

import { emailAvailable } from "./AuthenticationService";
import Error from "./Error";
import LoginSignUpInputField from "./LoginSignUpInputField";

const SignUpForm = ( ) => {
  const navigation = useNavigation( );
  const emailRef = useRef<TextInput>( null );
  const [email, setEmail] = useState( "" );
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
    const isAvailable = await emailAvailable( email );
    if ( isAvailable ) {
      navigation.navigate( "SignUpConfirmation", {
        user: {
          email
        }
      } );
    } else {
      setError( "Error" );
    }
  };

  return (
    <TouchableWithoutFeedback accessibilityRole="button" onPress={blurFields}>
      <View className="px-4 mt-[9px] justify-end">
        <LoginSignUpInputField
          ref={emailRef}
          accessibilityLabel={t( "EMAIL" )}
          autoComplete="email"
          headerText={t( "EMAIL" )}
          inputMode="email"
          keyboardType="email-address"
          onChangeText={( text: string ) => setEmail( text )}
          testID="Signup.email"
          textContentType="emailAddress"
        />
        {error && <Error error={error} />}
        <Button
          className="mt-[30px] mb-[35px]"
          disabled={!email}
          level="focus"
          forceDark
          onPress={( ) => onContinue( )}
          testID="Signup.signupButton"
          text={t( "CONTINUE" )}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignUpForm;
