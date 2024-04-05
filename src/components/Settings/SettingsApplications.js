// @flow

import { useQueryClient } from "@tanstack/react-query";
import {
  fetchAuthorizedApplications, revokeAuthorizedApplications
} from "api/authorizedApplications";
import fetchProviderAuthorizations from "api/providerAuthorizations";
import inatProviders from "dictionaries/providers";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Alert, Text, View } from "react-native";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import { textStyles, viewStyles } from "styles/settings/settings";

const SettingsApplications = ( ): Node => {
  const {
    data: authorizedApps,
    refetch
  } = useAuthenticatedQuery(
    ["fetchAuthorizedApplications"],
    optsWithAuth => fetchAuthorizedApplications( { }, optsWithAuth )
  );

  const {
    data: providerAuthorizations
  } = useAuthenticatedQuery(
    ["fetchProviderAuthorizations"],
    optsWithAuth => fetchProviderAuthorizations( { }, optsWithAuth )
  );

  const queryClient = useQueryClient( );

  const revokeAppMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => revokeAuthorizedApplications( params, optsWithAuth ),
    {
      onSuccess: ( ) => {
        queryClient.invalidateQueries( { queryKey: ["fetchAuthorizedApplications"] } );
        refetch( );
      }
    }
  );

  const revokeApp = async appId => {
    revokeAppMutation.mutate( { id: appId } );
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
    <View>
      <Text style={textStyles.title}>{t( "iNaturalist-Applications" )}</Text>
      {authorizedApps?.filter( app => app.application.official ).map( app => (
        <View key={app.application.id}>
          <Text>
            {app.application.name}
          </Text>
          <Pressable
            accessibilityRole="button"
            style={viewStyles.revokeAccess}
            onPress={() => askToRevokeApp( app )}
          >
            <Text>{t( "Revoke" )}</Text>
          </Pressable>
        </View>
      ) )}

      <Text style={[textStyles.title, textStyles.marginTop]}>{t( "Connected-Accounts" )}</Text>
      {Object.keys( inatProviders ).map( providerKey => {
        const connectedProvider = providerAuthorizations?.find(
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
      {authorizedApps?.filter( app => !app.application.official ).map( app => (
        <View key={app.application.id} style={[viewStyles.row, viewStyles.applicationRow]}>
          <Text style={textStyles.applicationName}>
            {t( "app-authorized-on-date", { appName: app.application.name, date: app.created_at } )}
          </Text>
          <Pressable
            accessibilityRole="button"
            style={viewStyles.revokeAccess}
            onPress={() => askToRevokeApp( app )}
          >
            <Text>{t( "Revoke" )}</Text>
          </Pressable>
        </View>
      ) )}
    </View>
  );
};

export default SettingsApplications;
