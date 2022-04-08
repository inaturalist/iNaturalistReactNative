import {Alert, Text, View} from "react-native";
import {viewStyles, textStyles} from "../../styles/settings/settings";
import React from "react";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import {inatProviders} from "../../dictionaries/providers";

const SettingsApplications = ( { authorizedApps, providerAuthorizations, onAppRevoked } ): React.Node => {
  const askToRevokeApp = ( app ) => {
    Alert.alert(
      `Revoke ${app.application.name}?`,
      "This will sign you out of your current session on this application.",
      [
        { text: "Revoke", onPress: () => onAppRevoked( app.application.id ) }
      ],
      {
        cancelable: true
      }
    );
  };

  return (
    <View style={viewStyles.column}>
      <Text style={textStyles.title}>iNaturalist Applications</Text>
      {authorizedApps.filter( ( app ) => app.application.official ).map( ( app ) => (
        <Text key={app.application.id}>{app.application.name} (authorized on: {app.created_at})</Text>
      ) )}

      <Text style={[textStyles.title, textStyles.marginTop]}>Connected Accounts</Text>
      {Object.keys( inatProviders ).map( ( providerKey ) => {
        const connectedProvider = providerAuthorizations.find( x => x.provider_name === providerKey );
        return ( <Text
          key={providerKey}>{inatProviders[providerKey]} {connectedProvider && `(authorized on: ${connectedProvider.created_at})`}</Text> );
      } )}


      <Text style={[textStyles.title, textStyles.marginTop]}>External Applications</Text>
      {authorizedApps.filter( ( app ) => !app.application.official ).map( ( app ) => (
        <View key={app.application.id} style={[viewStyles.row, viewStyles.applicationRow]}>
          <Text style={textStyles.applicationName}>{app.application.name} (authorized on: {app.created_at})</Text>
          <Pressable style={viewStyles.revokeAccess} onPress={() => askToRevokeApp( app )}><Text>Revoke</Text></Pressable>
        </View>
      ) )}
    </View>
  );
};

export default SettingsApplications;
