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

  const register = async ( ) => {
    await registerUser(
      email,
      username,
      password
    );
  };

  return (
    <View>
      <Text className="text-base mb-1">{t( "Sign-Up" )}</Text>

      <Text className="text-base mb-1">{t( "Email" )}</Text>
      <TextInput
        accessibilityLabel="Text input field"
        className="h-10 bg-lightGray"
        onChangeText={setEmail}
        value={email}
        autoComplete="email"
      />

      <Text className="text-base mb-1">{t( "Username" )}</Text>
      <TextInput
        accessibilityLabel="Text input field"
        className="h-10 bg-lightGray"
        onChangeText={setUsername}
        value={username}
      />

      <Text className="text-base mb-1">{t( "Password" )}</Text>
      <TextInput
        accessibilityLabel="Text input field"
        className="h-10 bg-lightGray"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      <Button title="Register" onPress={register} />
    </View>
  );
};

export default SignUp;
