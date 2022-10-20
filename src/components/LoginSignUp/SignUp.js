// @flow

import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import { View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

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
      <Text className="text-base mb-1">{t( "Sign-Up" )}</Text>

      <Text className="text-base mb-1">{t( "Email" )}</Text>
      <TextInput
        className="h-10 bg-tertiary"
        onChangeText={setEmail}
        value={email}
        autoComplete="email"
      />

      <Text className="text-base mb-1">{t( "Username" )}</Text>
      <TextInput
        className="h-10 bg-tertiary"
        onChangeText={setUsername}
        value={username}
      />

      <Text className="text-base mb-1">{t( "Password" )}</Text>
      <TextInput
        className="h-10 bg-tertiary"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      <Button title="Register" onPress={register} />
    </View>
  );
};

export default SignUp;
