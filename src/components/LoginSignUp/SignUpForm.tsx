import { useNavigation } from "@react-navigation/native";
import {
  Body1, Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React, { useEffect, useRef, useState } from "react";
import { TextInput, TouchableWithoutFeedback } from "react-native";

import LoginSignUpInputField from "./LoginSignUpInputField";

type Props = {
  hideFooter: boolean
}

const SignUpForm = ( { hideFooter }: Props ) => {
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
      <View className="px-4 justify-end">
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
          className="mt-[30px]"
          disabled={!email}
          level="focus"
          onPress={( ) => {
            navigation.navigate( "SignUpConfirmation", {
              user: {
                email
              }
            } );
          }}
          testID="Signup.signupButton"
          text={t( "CONTINUE" )}
        />
        {!hideFooter && (
          <Body1
            className="color-white self-center mt-[31px] mb-[35px] underline"
            onPress={( ) => navigation.navigate( "LoginStackNavigator", { screen: "Login" } )}
          >
            {t( "Already-have-an-account" )}
          </Body1>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignUpForm;
