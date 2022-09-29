// @flow

import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import {
  Button, Text, TextInput, View
} from "react-native";
import { textStyles, viewStyles } from "styles/login/login";

import { registerUser } from "./AuthenticationService";

const SignUp = (): Node => {
  const [email, setEmail] = useState( "" );
  const [username, setUsername] = useState( "" );
  const [password, setPassword] = useState( "" );

  const register = async () => {
    const error = await registerUser(
      email,
      username,
      password
    );

    console.log( "Register", error );
  };

  return (
    <View>
      <Text style={textStyles.text}>{t( "Sign-Up" )}</Text>

      <Text style={textStyles.text}>{t( "Email" )}</Text>
      <TextInput
        style={viewStyles.input}
        onChangeText={setEmail}
        value={email}
        autoComplete="email"
      />

      <Text style={textStyles.text}>{t( "Username" )}</Text>
      <TextInput
        style={viewStyles.input}
        onChangeText={setUsername}
        value={username}
      />

      <Text style={textStyles.text}>{t( "Password" )}</Text>
      <TextInput
        style={viewStyles.input}
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      <Button title="Register" onPress={register} />
    </View>
  );
};

export default SignUp;
