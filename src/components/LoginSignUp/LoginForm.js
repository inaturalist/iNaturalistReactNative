// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import {
  Body1, Body2, Button, Heading4, INatIcon,
  List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useState } from "react";
import { TextInput, useTheme } from "react-native-paper";

import {
  authenticateUser
} from "./AuthenticationService";
import Error from "./Error";

const { useRealm } = RealmContext;

type Props = {
  setLoggedIn: Function,
  handleInputFocus?: Function,
  emailConfirmed: ?boolean
}

const LoginForm = ( {
  emailConfirmed,
  handleInputFocus,
  setLoggedIn
}: Props ): Node => {
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

    navigation.getParent( )?.goBack( );
  };

  return (
    <View className="px-4 mt-[9px] justify-end grow">
      <View className="mx-4">
        <View className="mb-2">
          {emailConfirmed && (
            <View className="flex-row mb-5 items-center justify-center">
              <View className="bg-white rounded-full">
                <INatIcon
                  name="checkmark-circle"
                  color={theme.colors.secondary}
                  size={19}
                />
              </View>
              <List2 className="ml-3 text-white font-medium">
                {t( "Your-email-is-confirmed" )}
              </List2>
            </View>
          )}
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
        </View>
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
          autoCapitalize="none"
          testID="Login.password"
          selectionColor={theme.colors.tertiary}
          onFocus={handleInputFocus}
        />
        <Body2
          className="underline mt-[15px] self-end color-white"
          accessibilityRole="button"
          onPress={( ) => navigation.navigate( "ForgotPassword" )}
        >
          {t( "Forgot-Password" )}
        </Body2>
        {error && <Error error={error} />}
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
        forceDark
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
