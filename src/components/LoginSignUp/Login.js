// @flow

import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Linking,
  Platform,
  TouchableOpacity
} from "react-native";
import {
  Dialog, Paragraph, Portal, Text, TextInput
} from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

import colors from "../../styles/colors";
import viewStyles from "../../styles/login/login";
import Button from "../SharedComponents/Buttons/Button";
import {
  Image, KeyboardAvoidingView, Pressable,
  SafeAreaView,
  ScrollView, View
} from "../styledComponents";
import {
  authenticateUser,
  getUsername,
  isLoggedIn,
  signOut
} from "./AuthenticationService";

const Login = ( ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const [email, setEmail] = useState( "" );
  const [password, setPassword] = useState( "" );
  const [loggedIn, setLoggedIn] = useState( false );
  const [error, setError] = useState( null );
  const [username, setUsername] = useState( null );
  const [visible, setVisible] = useState( false );
  const [loading, setLoading] = useState( false );

  const showDialog = ( ) => setVisible( true );
  const hideDialog = ( ) => setVisible( false );

  useEffect( ( ) => {
    let isCurrent = true;

    const fetchLoggedIn = async ( ) => {
      if ( !isCurrent ) { return; }

      setLoggedIn( await isLoggedIn( ) );
      if ( loggedIn ) {
        setUsername( await getUsername( ) );
      }
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

    const userLogin = await getUsername( );
    setUsername( userLogin );
    setLoggedIn( true );
    setLoading( false );

    navigation.navigate( "MainStack", {
      screen: "ObsList"
    } );
  };

  const queryClient = useQueryClient( );

  const onSignOut = async ( ) => {
    await signOut( { deleteRealm: true, queryClient } );
    setLoggedIn( false );
  };

  const forgotPassword = () => {
    // TODO - should be put in a constant somewhere?
    Linking.openURL( "https://www.inaturalist.org/users/password/new" );
  };

  const logoutForm = (
    <>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Content>
            <Paragraph>{t( "Are-you-sure-you-want-to-sign-out" )}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              level="neutral"
              onPress={hideDialog}
              testID="Login.signOutButton"
              text={t( "Cancel" )}
            />
            <Button level="primary" onPress={onSignOut} text={t( "Sign-out" )} />
          </Dialog.Actions>
        </Dialog>
      </Portal>
      {/* TODO: figure out how to account for safe area views with h-screen,
      maybe something along these lines: https://github.com/mvllow/tailwindcss-safe-area/blob/70dbef61557b07e26b07a6167e13a377ba3c4625/index.js
      */}
      <View className="self-center justify-center h-screen">
        <Text testID="Login.loggedInAs">{t( "Logged-in-as", { username } )}</Text>
        <Button
          level="primary"
          style={viewStyles.button}
          onPress={showDialog}
          testID="Login.signOutButton"
          text="Sign-out"
        />
      </View>
    </>
  );

  const loginForm = (
    <>
      <Image
        className="self-center w-32 h-32"
        resizeMode="contain"
        source={require( "../../images/inat_logo.png" )}
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
      />
      <TouchableOpacity onPress={forgotPassword}>
        <Text className="underline mt-4 self-end">{t( "Forgot-Password" )}</Text>
      </TouchableOpacity>
      {error && <Text className="text-red self-center mt-5">{error}</Text>}
      <Button
        level="primary"
        text="Log-in"
        onPress={login}
        style={viewStyles.button}
        disabled={!email || !password}
        testID="Login.loginButton"
        loading={loading}
      />
    </>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 p-10">
          <Pressable
            onPress={() => navigation.goBack()}
            className="absolute top-0 right-0"
          >
            <IconMaterial name="close" size={35} />
          </Pressable>
          {loggedIn ? logoutForm : loginForm}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Login;
