// @flow

import { t } from "i18next";
import inatjs from "inaturalistjs";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import { textStyles, viewStyles } from "styles/settings/settings";

import inatProviders from "../../dictionaries/providers";
import useAuthorizedApplications from "./hooks/useAuthorizedApplications";
import useProviderAuthorizations from "./hooks/useProviderAuthorizations";

type Props = {
  accessToken: string
}

const SettingsApplications = ( { accessToken }: Props ): Node => {
  const currentAuthorizedApps = useAuthorizedApplications( accessToken );
  const [authorizedApps, setAuthorizedApps] = useState( [] );
  const providerAuthorizations = useProviderAuthorizations( accessToken );

  useEffect( () => {
    setAuthorizedApps( currentAuthorizedApps );
  }, [currentAuthorizedApps] );

  const revokeApp = async appId => {
    const response = await inatjs.authorized_applications.delete(
      { id: appId },
      { api_token: accessToken }
    );
    console.log( "Revoked app", response );
    // Refresh authorized applications
    const apps = await inatjs.authorized_applications.search( {}, { api_token: accessToken } );
    console.log( "Authorized Applications", apps.results );
    setAuthorizedApps( apps.results );
  };

  const askToRevokeApp = app => {
    Alert.alert(
      `Revoke ${app.application.name}?`,
      "This will sign you out of your current session on this application.",
      [
        { text: "Revoke", onPress: () => revokeApp( app.application.id ) }
      ],
      {
        cancelable: true
      }
    );
  };

  return (
    <View style={viewStyles.column}>
      <Text style={textStyles.title}>{t( "iNaturalist-Applications" )}</Text>
      {authorizedApps.filter( app => app.application.official ).map( app => (
        <Text key={app.application.id}>
          {t( "authorized-on-date", { appName: app.application.name, date: app.created_at } )}
        </Text>
      ) )}

      <Text style={[textStyles.title, textStyles.marginTop]}>{t( "Connected-Accounts" )}</Text>
      {Object.keys( inatProviders ).map( providerKey => {
        const connectedProvider = providerAuthorizations.find(
          x => x.provider_name === providerKey
        );
        return (
          <Text
            key={providerKey}
          >
            {inatProviders[providerKey]}
            {" "}
            {connectedProvider && `(authorized on: ${connectedProvider.created_at})`}
          </Text>
        );
      } )}

      <Text style={[textStyles.title, textStyles.marginTop]}>{t( "External-Applications" )}</Text>
      {authorizedApps.filter( app => !app.application.official ).map( app => (
        <View key={app.application.id} style={[viewStyles.row, viewStyles.applicationRow]}>
          <Text style={textStyles.applicationName}>
            {t( "authorized-on-date", { appName: app.application.name, date: app.created_at } )}
          </Text>
          <Pressable style={viewStyles.revokeAccess} onPress={() => askToRevokeApp( app )}>
            <Text>{t( "Revoke" )}</Text>
          </Pressable>
        </View>
      ) )}
    </View>
  );
};

export default SettingsApplications;
