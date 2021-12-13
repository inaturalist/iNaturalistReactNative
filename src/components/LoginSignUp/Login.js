// @flow strict-local

import React, { useState } from "react";
import { Alert, Button, Pressable, Text, TextInput, View } from "react-native";
import RNSInfo from "react-native-sensitive-info";
import type { Node } from "react";

import { viewStyles, textStyles } from "../../styles/login/login";
import AuthenticationService from "./AuthenticationService";

const Login = (): Node => {
  const [email, setEmail] = useState( "" );
  const [password, setPassword] = useState( "" );

  const login = async () => {
    const success = await AuthenticationService.authenticateUser(
      email,
      password
    );

    console.log( "success", success );
    console.log( "accessToken", await RNSInfo.getItem( "accessToken", {} ) );
    console.log( "username", await RNSInfo.getItem( "username", {} ) );
  };

  return (
    <View>
      <Text style={textStyles.text}>Login</Text>

      <Text style={textStyles.text}>Email</Text>
      <TextInput
        style={viewStyles.input}
        onChangeText={setEmail}
        value={email}
        autoCompleteType={"email"}
      />
      <Text style={textStyles.text}>Password</Text>
      <TextInput
        style={viewStyles.input}
        onChangeText={setPassword}
        value={password}
        secureTextEntry={true}
      />
      <Button title="Login" onPress={login} />
    </View>
  );
};

export default Login;
