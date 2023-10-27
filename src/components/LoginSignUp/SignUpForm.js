// @flow

import { useNavigation } from "@react-navigation/native";
import {
  Body1, Button, Heading4
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import { TextInput, useTheme } from "react-native-paper";

type Props = {
  handleInputFocus?: Function
}

const SignUpForm = ( { handleInputFocus }: Props ): Node => {
  const navigation = useNavigation( );
  const [email, setEmail] = useState( "" );
  const [username, setUsername] = useState( "" );
  const [password, setPassword] = useState( "" );
  const theme = useTheme( );

  return (
    <View className="px-4 mt-[9px] justify-end">
      <View className="mx-4">
        <Heading4 className="color-white mb-[11px]">{t( "EMAIL" )}</Heading4>
        <TextInput
          accessibilityLabel={t( "EMAIL" )}
          className="h-[45px] rounded-md"
          onChangeText={text => setEmail( text )}
          value={email}
          autoComplete="email"
          testID="Signup.email"
          autoCapitalize="none"
          keyboardType="email-address"
          selectionColor={theme.colors.tertiary}
          onFocus={handleInputFocus}
        />
        <Heading4 className="color-white mb-[11px] mt-[9px]">{t( "USERNAME" )}</Heading4>
        <TextInput
          accessibilityLabel={t( "USERNAME" )}
          className="h-[45px] rounded-md"
          onChangeText={text => setUsername( text )}
          value={username}
          testID="Signup.username"
          autoCapitalize="none"
          selectionColor={theme.colors.tertiary}
          onFocus={handleInputFocus}
        />
        <Heading4 className="color-white mb-[11px] mt-[9px]">{t( "PASSWORD" )}</Heading4>
        <TextInput
          accessibilityLabel={t( "PASSWORD" )}
          className="h-[45px] rounded-md"
          onChangeText={text => setPassword( text )}
          value={password}
          secureTextEntry
          testID="Signup.password"
          selectionColor={theme.colors.tertiary}
          onFocus={handleInputFocus}
        />
      </View>
      <Button
        level="focus"
        text={t( "CREATE-AN-ACCOUNT" )}
        onPress={( ) => {
          navigation.navigate( "LicensePhotos", {
            user: {
              email,
              login: username,
              password
            }
          } );
        }}
        className="mt-[30px]"
        disabled={!email || !password || !username}
        testID="Signup.signupButton"
      />
      <Body1
        className="color-white self-center mt-[30px] underline"
        onPress={( ) => navigation.navigate( "LoginNavigator", { screen: "Login" } )}
      >
        {t( "Already-have-an-account" )}
      </Body1>
    </View>
  );
};

export default SignUpForm;
