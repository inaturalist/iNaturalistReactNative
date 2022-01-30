// @flow strict-local

import React, { useEffect, useState } from "react";
import {Button, Text, TextInput, View} from "react-native";
import type { Node } from "react";

import { viewStyles, textStyles } from "../../styles/login/login";
import AuthenticationService from "./AuthenticationService";

const Login = (): Node => {
  const [email, setEmail] = useState( "" );
  const [password, setPassword] = useState( "" );
  const [isLoggedIn, setIsLoggedIn] = useState( false );
  const [error, setError] = useState( null );
  const [username, setUsername] = useState( null );

  useEffect( () => {
    AuthenticationService.isLoggedIn().then( ( loggedIn ) => {
      setIsLoggedIn( loggedIn );
    } );
  }, [] );

  const login = async () => {
    const success = await AuthenticationService.authenticateUser(
      email,
      password
    );

    if ( !success ) {
      setError( "Couldn't login" );
      return;
    }

    setUsername( await AuthenticationService.getUsername() );
    setIsLoggedIn( true );
  };

  /*
  const signOut = () => {
    await AuthenticationService.signOut();
    setIsLoggedIn( false );
  };
   */

  return (
    <View>
      {!isLoggedIn ? (
        <>
          <Text style={textStyles.text}>Login</Text>

          <Text style={textStyles.text}>Email</Text>
          <TextInput
            style={viewStyles.input}
            onChangeText={setEmail}
            value={email}
            autoCompleteType={"email"}
            testID="Login.email"
          />
          <Text style={textStyles.text}>Password</Text>
          <TextInput
            style={viewStyles.input}
            onChangeText={setPassword}
            value={password}
            secureTextEntry={true}
            testID="Login.password"
          />
          <Button title="Login" onPress={login} testID="Login.loginButton" />

          {error && <Text style={textStyles.error}>{error}</Text>}
        </>
      ) : (
        <>
          <Text style={textStyles.text} testID="Login.loggedInAs">Logged in as: {username}</Text>
        </>
      )}
    </View>
  );
  //<Button title="Sign out" onPress={signOut} testID="Login.signOutButton" />
};

export default Login;
