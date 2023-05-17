// @flow

import { CommonActions, useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import {
  Body1, Body2,
  Button, Heading4, INatIcon,
  List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useState } from "react";
import { Linking } from "react-native";
import { TextInput, useTheme } from "react-native-paper";

import {
  authenticateUser
} from "./AuthenticationService";

const { useRealm } = RealmContext;

type Props = {
  setLoggedIn: Function,
  handleInputFocus: Function
}

const LoginForm = ( { setLoggedIn, handleInputFocus }: Props ): Node => {
  const realm = useRealm( );
  const navigation = useNavigation( );
  const [email, setEmail] = useState( "" );
  const [password, setPassword] = useState( "" );
  const [error, setError] = useState( null );
  const [loading, setLoading] = useState( false );
  const theme = useTheme();

  const login = async ( ) => {
    setLoading( true );
    const success = await authenticateUser(
      email.trim( ),
      password,
      realm
    );

    if ( !success ) {
      setError( t( "Failed-to-log-in" ) );
      setLoading( false );
      return;
    }
    setLoggedIn( true );
    setLoading( false );

    // Reset navigation state so that ObsList gets rerendered
    navigation.dispatch( CommonActions.reset( {
      index: 0,
      routes: [{ name: "ObsList" }]
    } ) );

    navigation.navigate( "ObsList" );
  };

  const forgotPassword = ( ) => {
    // TODO - should be put in a constant somewhere?
    Linking.openURL( "https://www.inaturalist.org/users/password/new" );
  };

  return (
    <View className="px-4 mt-[9px] justify-end">
      <View className="mx-4">
        <Heading4 className="color-white mb-[11px]">{t( "USERNAME-OR-EMAIL" )}</Heading4>
        <TextInput
          accessibilityLabel={t( "USERNAME-OR-EMAIL" )}
          className="h-[45px] rounded-md"
          onChangeText={text => {
            setError( null );
            setEmail( text );
          }}
          value={email}
          autoComplete="email"
          testID="Login.email"
          autoCapitalize="none"
          keyboardType="email-address"
          selectionColor={theme.colors.tertiary}
          onFocus={handleInputFocus}
        />
        <Heading4 className="color-white mb-[11px] mt-[9px]">{t( "PASSWORD" )}</Heading4>
        <TextInput
          accessibilityLabel={t( "PASSWORD" )}
          className="h-[45px] rounded-md"
          onChangeText={text => {
            setError( null );
            setPassword( text );
          }}
          value={password}
          secureTextEntry
          testID="Login.password"
          selectionColor={theme.colors.tertiary}
          onFocus={handleInputFocus}
        />
        <Body2
          className="underline mt-[15px] self-end color-white"
          accessibilityRole="button"
          onPress={forgotPassword}
        >
          {t( "Forgot-Password" )}
        </Body2>
        {error && (
          <View className="flex-row items-center justify-center mt-5">
            <INatIcon name="triangle-exclamation" size={19} color={theme.colors.error} />
            <List2 className="color-white ml-3">
              {error}
            </List2>
          </View>
        )}
      </View>
      <Button
        level="focus"
        text={t( "LOG-IN" )}
        onPress={login}
        className={classnames( "mt-[30px]", {
          "mt-5": error
        } )}
        disabled={!email || !password}
        testID="Login.loginButton"
        loading={loading}
      />
      <Body1
        className="color-white self-center mt-[30px] underline"
        onPress={( ) => navigation.navigate( "SignUp" )}
      >
        {t( "Dont-have-an-account" )}
      </Body1>
    </View>
  );
};

export default LoginForm;
