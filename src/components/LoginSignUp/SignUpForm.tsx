import { useNavigation } from "@react-navigation/native";
import { Button } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React, { useEffect, useRef, useState } from "react";
import { TextInput, TouchableWithoutFeedback } from "react-native";

import LoginSignUpInputField from "./LoginSignUpInputField";

const SignUpForm = ( ) => {
  const navigation = useNavigation( );
  const [email, setEmail] = useState( "" );
  const emailRef = useRef<TextInput>( null );

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
        <Button
          className="mt-[30px] mb-[35px]"
          disabled={!email}
          level="focus"
          onPress={( ) => {
            // TODO: Implement email validation before navigating
            navigation.navigate( "SignUpConfirmation", {
              user: {
                email
              }
            } );
          }}
          testID="Signup.signupButton"
          text={t( "CONTINUE" )}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignUpForm;
