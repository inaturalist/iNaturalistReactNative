// @flow

import { CommonActions, useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import {
  Body1, Body2,
  Button, CloseButton, Heading4, INatIcon,
  List2
} from "components/SharedComponents";
import {
  Image, ImageBackground,
  SafeAreaView, View
} from "components/styledComponents";
import { t } from "i18next";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect, useRef, useState } from "react";
import { Linking } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TextInput, useTheme } from "react-native-paper";

import {
  authenticateUser,
  isLoggedIn
} from "./AuthenticationService";
import Logout from "./Logout";

const { useRealm } = RealmContext;

const Login = ( ): Node => {
  const keyboardScrollRef = useRef( null );
  const navigation = useNavigation( );
  const [email, setEmail] = useState( "" );
  const [password, setPassword] = useState( "" );
  const [loggedIn, setLoggedIn] = useState( false );
  const [error, setError] = useState( null );
  const [loading, setLoading] = useState( false );
  const [extraScrollHeight, setExtraScrollHeight] = useState( 0 );
  const realm = useRealm( );
  const theme = useTheme();

  useEffect( ( ) => {
    let isCurrent = true;

    const fetchLoggedIn = async ( ) => {
      const login = await isLoggedIn( );
      if ( !isCurrent ) { return; }
      setLoggedIn( login );
    };

    fetchLoggedIn( );

    return ( ) => {
      isCurrent = false;
    };
  }, [loggedIn] );

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
    <SafeAreaView className="bg-black flex-1">
      <ImageBackground
        source={require( "images/toucan.png" )}
        className="flex-1"
      >
        {loggedIn ? <Logout /> : (
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="always"
            ref={keyboardScrollRef}
            enableOnAndroid
            enableAutomaticScroll
            extraScrollHeight={extraScrollHeight}
            className="p-4"
            // eslint-disable-next-line react-native/no-inline-styles
            contentContainerStyle={{
              flex: 1,
              justifyContent: "space-between"
            }}
          >
            <View>
              <View className="self-end">
                <CloseButton size={19} />
              </View>
              <Image
                className="self-center w-[234px] h-[48px]"
                resizeMode="contain"
                source={require( "images/inaturalist.png" )}
                accessibilityIgnoresInvertColors
              />
              <Body1 className="self-center text-center color-white mt-8 max-w-[280px]">
                {t( "Login-sub-title" )}
              </Body1>
            </View>
            <View>
              <View className="mx-4">
                <Heading4 className="color-white mb-3">{t( "USERNAME-OR-EMAIL" )}</Heading4>
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
                  onFocus={() => setExtraScrollHeight( 200 )}
                />
                <Heading4 className="color-white mb-3 mt-6">{t( "PASSWORD" )}</Heading4>
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
                  onFocus={() => setExtraScrollHeight( 200 )}
                />
                <Body2
                  className="underline mt-5 self-end color-white"
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
                className={classnames( "mt-8", {
                  "mt-5": error
                } )}
                disabled={!email || !password}
                testID="Login.loginButton"
                loading={loading}
              />
              <Body1
                className="color-white self-center mt-8 underline"
                onPress={( ) => navigation.navigate( "SignUp" )}
              >
                {t( "Dont-have-an-account" )}
              </Body1>
            </View>
          </KeyboardAwareScrollView>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Login;
