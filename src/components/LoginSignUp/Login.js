// @flow

import { useNavigation } from "@react-navigation/native";
import Button from "components/SharedComponents/Buttons/Button";
import {
  Image, Pressable, SafeAreaView
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect, useRef, useState } from "react";
import {
  findNodeHandle,
  Linking,
  TouchableOpacity
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  Text, TextInput
} from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import colors from "styles/tailwindColors";

import {
  authenticateUser,
  isLoggedIn
} from "./AuthenticationService";
import Logout from "./Logout";

const Login = ( ): Node => {
  const keyboardScrollRef = useRef( null );
  const navigation = useNavigation( );
  const [email, setEmail] = useState( "" );
  const [password, setPassword] = useState( "" );
  const [loggedIn, setLoggedIn] = useState( false );
  const [error, setError] = useState( null );
  const [loading, setLoading] = useState( false );

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
      password
    );

    if ( !success ) {
      setError( t( "Invalid-login" ) );
      setLoading( false );
      return;
    }
    setLoggedIn( true );
    setLoading( false );

    navigation.navigate( "MainStack", {
      screen: "ObsList"
    } );
  };

  const forgotPassword = ( ) => {
    // TODO - should be put in a constant somewhere?
    Linking.openURL( "https://www.inaturalist.org/users/password/new" );
  };

  const scrollToInput = node => {
    keyboardScrollRef?.current?.scrollToFocusedInput( node );
  };

  const loginForm = (
    <>
      <Image
        className="self-center w-32 h-32"
        resizeMode="contain"
        source={require( "images/inat_logo.png" )}
      />

      <Text className="text-2xl self-center mt-5">{t( "Login-header" )}</Text>
      <Text className="text-xl self-center text-center mt-5 mb-5">{t( "Login-sub-title" )}</Text>
      <Text className="text-base mb-1">{t( "Username-or-Email" )}</Text>
      <TextInput
        className="h-10 bg-tertiary"
        onChangeText={text => {
          setError( null );
          setEmail( text );
        }}
        value={email}
        autoComplete="email"
        testID="Login.email"
        autoCapitalize="none"
        keyboardType="email-address"
        selectionColor={colors.black}
        onFocus={e => scrollToInput( findNodeHandle( e.target ) )}
      />
      <Text className="text-base mb-1 mt-5">{t( "Password" )}</Text>
      <TextInput
        className="h-10 bg-tertiary"
        onChangeText={text => {
          setError( null );
          setPassword( text );
        }}
        value={password}
        secureTextEntry
        testID="Login.password"
        selectionColor={colors.black}
        onFocus={e => scrollToInput( findNodeHandle( e.target ) )}
      />
      <TouchableOpacity onPress={forgotPassword}>
        <Text className="underline mt-4 self-end">{t( "Forgot-Password" )}</Text>
      </TouchableOpacity>
      {error && <Text className="text-red self-center mt-5">{error}</Text>}
      <Button
        level="primary"
        text={t( "Log-in" )}
        onPress={login}
        className="mt-5"
        disabled={!email || !password}
        testID="Login.loginButton"
        loading={loading}
      />
    </>
  );

  return (
    <SafeAreaView className="m-8 flex-1">
      <KeyboardAwareScrollView
        ref={keyboardScrollRef}
        enableOnAndroid
        extraHeight={290}
      >
        <Pressable
          onPress={( ) => navigation.goBack( )}
          className="absolute top-0 right-0"
        >
          <IconMaterial name="close" size={35} />
        </Pressable>
        {loggedIn ? <Logout /> : loginForm}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default Login;
