// @flow

import React, { useEffect, useState } from "react";
import { Text, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import { Button, Paragraph, Dialog, Portal } from "react-native-paper";

import { textStyles, viewStyles } from "../../styles/login/login";
import { isLoggedIn, authenticateUser, getUsername, getUserId, signOut } from "./AuthenticationService";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { useTranslation } from "react-i18next";

const Login = ( ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const [email, setEmail] = useState( "" );
  const [password, setPassword] = useState( "" );
  const [loggedIn, setLoggedIn] = useState( false );
  const [error, setError] = useState( null );
  const [username, setUsername] = useState( null );
  const [visible, setVisible] = useState( false );

  const showDialog = ( ) => setVisible( true );
  const hideDialog = ( ) => setVisible( false );

  useEffect( ( ) => {
    let isCurrent = true;

    isLoggedIn( ).then( ( result ) => {
      if ( !isCurrent ) {return;}

      setLoggedIn( result );
    } );

    return ( ) => {
      isCurrent = false;
    };
  }, [] );

  const login = async ( ) => {
    const success = await authenticateUser(
      email.trim( ),
      password
    );

    if ( !success ) {
      setError( "Couldn't login" );
      return;
    }

    const userLogin = await getUsername( );
    const userId = await getUserId( );
    setUsername( userLogin );
    setLoggedIn( true );
    navigation.navigate( "my observations", {
      screen: "ObsList",
      params: { syncData: true, userLogin, userId }
    } );
  };

  const onSignOut = async ( ) => {
    await signOut( );
    setLoggedIn( false );
  };

  return (
    <ViewWithFooter>
      {loggedIn
        ? (
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
            <Text style={textStyles.text} testID="Login.loggedInAs">Logged in as: {username}</Text>
            <Button style={viewStyles.greenButton} onPress={showDialog} testID="Login.signOutButton">
              {t( "Sign-out" )}
            </Button>
          </>
        )
        : (
          <>
            <Text style={textStyles.text}>Login</Text>
            <Text style={textStyles.text}>Email</Text>
            <TextInput
              style={textStyles.input}
              onChangeText={text => {
                setError( null );
                setEmail( text );
              }}
              value={email}
              autoComplete="email"
              testID="Login.email"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Text style={textStyles.text}>Password</Text>
            <TextInput
              style={textStyles.input}
              onChangeText={text => {
                setError( null );
                setPassword( text );
              }}
              value={password}
              secureTextEntry={true}
              testID="Login.password"
            />
            <Button style={viewStyles.greenButton} onPress={login} testID="Login.loginButton">
              {t( "Log-in" )}
            </Button>
            {error && <Text style={textStyles.error}>{error}</Text>}
          </>
        )}
    </ViewWithFooter>
  );
};

export default Login;
