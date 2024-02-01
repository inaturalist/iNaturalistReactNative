// @flow

import { useNavigation } from "@react-navigation/native";
import {
  Body1, Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";

import LoginSignUpInputField from "./LoginSignUpInputField";

type Props = {
  hideFooter: boolean
}

const SignUpForm = ( { hideFooter }: Props ): Node => {
  const navigation = useNavigation( );
  const [email, setEmail] = useState( "" );
  const [username, setUsername] = useState( "" );
  const [password, setPassword] = useState( "" );

  return (
    <View className="px-4 mt-[9px] justify-end">
      <LoginSignUpInputField
        accessibilityLabel={t( "EMAIL" )}
        autoComplete="email"
        headerText={t( "EMAIL" )}
        keyboardType="email-address"
        onChangeText={text => setEmail( text )}
        testID="Signup.email"
        value={email}
      />
      <LoginSignUpInputField
        accessibilityLabel={t( "USERNAME" )}
        headerText={t( "USERNAME" )}
        onChangeText={text => setUsername( text )}
        testID="Signup.username"
        value={username}
      />
      <LoginSignUpInputField
        accessibilityLabel={t( "PASSWORD" )}
        headerText={t( "PASSWORD" )}
        onChangeText={text => setPassword( text )}
        secureTextEntry
        testID="Signup.password"
        value={password}
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
          onPress={( ) => navigation.navigate( "LoginNavigator", { screen: "Login" } )}
        >
          {t( "Already-have-an-account" )}
        </Body1>
      )}
    </View>
  );
};

export default SignUpForm;
