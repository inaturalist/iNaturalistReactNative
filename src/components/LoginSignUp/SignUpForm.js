// @flow

import { useNavigation } from "@react-navigation/native";
import {
  Body1, Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect, useRef, useState } from "react";
import { TouchableWithoutFeedback } from "react-native";

import LoginSignUpInputField from "./LoginSignUpInputField";

type Props = {
  hideFooter: boolean
}

const SignUpForm = ( { hideFooter }: Props ): Node => {
  const navigation = useNavigation( );
  const [email, setEmail] = useState( "" );
  const [username, setUsername] = useState( "" );
  const [password, setPassword] = useState( "" );
  const usernameRef = useRef( null );
  const emailRef = useRef( null );
  const passwordRef = useRef( null );

  const blurFields = () => {
    if ( emailRef.current ) {
      emailRef.current.blur();
    }
    if ( usernameRef.current ) {
      usernameRef.current.blur();
    }
    if ( passwordRef.current ) {
      passwordRef.current.blur();
    }
  };

  useEffect( () => {
    const listener1 = navigation.addListener( "blur", blurFields );
    const listener2 = navigation.addListener( "transitionEnd", blurFields );

    return () => {
      listener1.remove();
      listener2.remove();
    };
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
          onChangeText={text => setEmail( text )}
          testID="Signup.email"
          textContentType="emailAddress"
        />
        <LoginSignUpInputField
          ref={usernameRef}
          accessibilityLabel={t( "USERNAME" )}
          headerText={t( "USERNAME" )}
          onChangeText={text => setUsername( text )}
          testID="Signup.username"
          textContentType="username"
        />
        <LoginSignUpInputField
          ref={passwordRef}
          accessibilityLabel={t( "PASSWORD" )}
          autoComplete="new-password"
          headerText={t( "PASSWORD" )}
          onChangeText={text => setPassword( text )}
          secureTextEntry
          testID="Signup.password"
          textContentType="newPassword"
        />
        <Button
          className="mt-[30px]"
          disabled={!email || !password || !username}
          level="focus"
          onPress={( ) => {
            navigation.navigate( "LicensePhotos", {
              user: {
                email,
                login: username,
                password
              }
            } );
          }}
          testID="Signup.signupButton"
          text={t( "CREATE-AN-ACCOUNT" )}
        />
        {!hideFooter && (
          <Body1
            className="color-white self-center mt-[30px] underline"
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
