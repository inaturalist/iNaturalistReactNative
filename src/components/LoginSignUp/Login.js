// @flow

import { useNavigation, CommonActions } from "@react-navigation/native";
import { Button } from "components/SharedComponents";
import {
  Image, Pressable, SafeAreaView
} from "components/styledComponents";
import { t } from "i18next";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect, useRef, useState } from "react";
import {
  Linking,
  TouchableOpacity
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  Text, TextInput,
  useTheme
} from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

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
      setError( t( "Invalid-login" ) );
      setLoading( false );
      return;
    }
    setLoggedIn( true );
    setLoading( false );


    // Reset navigation state so that ObsList gets rerendered
    navigation.dispatch(CommonActions.reset({
        index: 0,
        routes: [{ name: "ObsList" }],
    }));

    navigation.navigate("ObsList")
  };

  const forgotPassword = ( ) => {
    // TODO - should be put in a constant somewhere?
    Linking.openURL( "https://www.inaturalist.org/users/password/new" );
  };

  const loginForm = (
    <>
      <Image
        className="self-center w-32 h-32"
        resizeMode="contain"
        source={require( "images/inat_logo.png" )}
        accessibilityIgnoresInvertColors
      />

      <Text testID="login-header" className="text-2xl self-center mt-5">{t( "Login-header" )}</Text>
      <Text className="text-xl self-center text-center mt-5 mb-5">{t( "Login-sub-title" )}</Text>
      <Text className="text-base mb-1">{t( "Username-or-Email" )}</Text>
      <TextInput
        accessibilityLabel={t( "Username-or-Email" )}
        className="h-10 bg-lightGray"
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
      <Text className="text-base mb-1 mt-5">{t( "Password" )}</Text>
      <TextInput
        accessibilityLabel={t( "Password" )}
        className="h-10 bg-lightGray"
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
      <TouchableOpacity accessibilityRole="button" onPress={forgotPassword}>
        <Text className="underline mt-2 self-end">{t( "Forgot-Password" )}</Text>
      </TouchableOpacity>
      {error && <Text className="text-warningRed self-center mt-5">{error}</Text>}
      <Button
        level="focus"
        text={t( "Log-in" )}
        onPress={login}
        className="mt-5"
        disabled={!email || !password}
        testID="Login.loginButton"
        loading={loading}
      />
    </>
  );

  const renderBackButton = ( ) => (
    <Pressable
      accessibilityRole="button"
      onPress={( ) => navigation.goBack( )}
      className="absolute top-0 right-0"
    >
      <IconMaterial name="close" size={35} />
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1">
      {loggedIn ? <Logout /> : (
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="always"
          ref={keyboardScrollRef}
          enableOnAndroid
          enableAutomaticScroll
          extraScrollHeight={extraScrollHeight}
          className="p-8"
        >
          {renderBackButton( )}
          {loginForm}
        </KeyboardAwareScrollView>
      )}
    </SafeAreaView>
  );
};

export default Login;
