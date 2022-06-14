// @flow

import {Button, Image, Text, TextInput, View} from "react-native";
import {viewStyles} from "../../styles/settings/settings";
// $FlowIgnore
import {launchImageLibrary} from "react-native-image-picker";
import React from "react";
import type { Node } from "react";
import type { SettingsProps } from "./types";

const SettingsProfile = ( { settings, onSettingsModified }: SettingsProps ): Node => {

  let profileSource;
  if ( settings.newProfilePhoto && !settings.removeProfilePhoto ) {
    profileSource = { uri: settings.newProfilePhoto.uri };
  } else if (
    settings.icon && !settings.removeProfilePhoto ) { profileSource = { uri: settings.icon };
  } else {
    profileSource = require( "./../../images/profile.png" );
  }

  const onImageSelected = ( response ) => {
    if ( response.didCancel ) {return;}
    onSettingsModified( { ...settings, newProfilePhoto: response.assets[0], removeProfilePhoto: false } );
  };

  return (
    <>
      <Text>Profile Picture</Text>
      <View style={viewStyles.row}>
        <Image
          style={viewStyles.profileImage}
          source={profileSource}
        />
        <View style={viewStyles.column}>
          <Button title="Upload New Photo" onPress={() => launchImageLibrary( {}, onImageSelected )} />
          <Button title="Remove Photo" onPress={() => onSettingsModified( { ...settings, removeProfilePhoto: true } )} />
        </View>
      </View>
      <View style={viewStyles.column}>
        <Text>Username</Text>
        <TextInput
          style={viewStyles.textInput}
          onChangeText={( x ) => onSettingsModified( { ...settings, login: x} )}
          value={settings.login}
        />
      </View>
      <View style={viewStyles.column}>
        <Text>Email</Text>
        <TextInput
          style={viewStyles.textInput}
          onChangeText={( x ) => onSettingsModified( { ...settings, email: x} )}
          value={settings.email}
        />
      </View>
      <View style={viewStyles.column}>
        <Text>Display Name</Text>
        <TextInput
          style={viewStyles.textInput}
          onChangeText={( x ) => onSettingsModified( { ...settings, name: x} )}
          value={settings.name}
        />
      </View>
      <View style={viewStyles.column}>
        <Text>Bio</Text>
        <TextInput
          style={viewStyles.textInput}
          multiline
          numberOfLines={4}
          onChangeText={( x ) => onSettingsModified( { ...settings, description: x} )}
          value={settings.description}
        />
      </View>
    </>
  );
};

export default SettingsProfile;
