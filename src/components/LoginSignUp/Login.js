// @flow

import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View
} from "react-native";
import {
  Button, Dialog, Paragraph, Portal, Text, TextInput
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import colors from "../../styles/colors";
import {
  closeButton, imageStyles, textStyles, viewStyles
} from "../../styles/login/login";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
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
            <Button style={viewStyles.grayButton} onPress={hideDialog} testID="Login.signOutButton">
              {t( "Cancel" )}
            </Button>
            <Button style={viewStyles.greenButton} onPress={onSignOut}>
              {t( "Sign-out" )}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <View style={viewStyles.logoutForm}>
        <Text testID="Login.loggedInAs">{t( "Logged-in-as", { username } )}</Text>
        <RoundGreenButton
          style={viewStyles.button}
          handlePress={showDialog}
          testID="Login.signOutButton"
          buttonText="Sign-out"
        />
      </View>
    </>
  );

  const loginForm = (
    <>
      <Image
        style={imageStyles.logo}
        resizeMode="contain"
        source={require( "../../images/inat_logo.png" )}
      />

      <Text style={textStyles.header}>{t( "Login-header" )}</Text>
      <Text style={textStyles.subtitle}>{t( "Login-sub-title" )}</Text>
      <Text style={textStyles.fieldText}>{t( "Username-or-Email" )}</Text>
      <TextInput
        style={viewStyles.input}
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
      <Text style={textStyles.fieldText}>{t( "Password" )}</Text>
      <TextInput
        style={viewStyles.input}
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
        <Text style={textStyles.forgotPassword}>{t( "Forgot-Password" )}</Text>
      </TouchableOpacity>
      {error && <Text style={textStyles.error}>{error}</Text>}
      <RoundGreenButton
        style={viewStyles.button}
        buttonText="Log-in"
        handlePress={login}
        disabled={!email || !password}
        testID="Login.loginButton"
        loading={loading}
      />
    </>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={viewStyles.container}
    >
      <SafeAreaView style={[viewStyles.container]}>
        <ScrollView
          contentContainerStyle={viewStyles.paddedContainer}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            style={closeButton.close}
          >
            <Icon name="close" size={35} />
          </Pressable>
          {loggedIn ? logoutForm : loginForm}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Login;
