// @flow

import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import Button from "components/SharedComponents/Buttons/Button";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog, Paragraph, Portal, Text
} from "react-native-paper";
import viewStyles from "styles/login/login";

import {
  getUsername,
  signOut
} from "./AuthenticationService";

const { useRealm } = RealmContext;

const Logout = ( ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const [username, setUsername] = useState( null );
  const [visible, setVisible] = useState( false );
  const realm = useRealm( );

  const showDialog = ( ) => setVisible( true );
  const hideDialog = ( ) => setVisible( false );

  useEffect( ( ) => {
    let isCurrent = true;

    const fetchUsername = async ( ) => {
      const name = await getUsername( );
      if ( !isCurrent ) { return; }
      setUsername( name );
    };

    fetchUsername( );

    return ( ) => {
      isCurrent = false;
    };
  }, [] );

  const queryClient = useQueryClient( );

  const onSignOut = async ( ) => {
    await signOut( { realm, deleteRealm: true, queryClient } );
    // TODO might be necessary to restart the app at this point. We just
    // deleted the realm file on disk, but the RealmProvider may still have a
    // copy of realm in local state
    navigation.navigate( "MainStack", {
      screen: "ObsList"
    } );
  };

  return (
    <>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Content>
            <Paragraph>{t( "Are-you-sure-you-want-to-sign-out" )}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              level="neutral"
              onPress={hideDialog}
              testID="Login.signOutButton"
              text={t( "Cancel" )}
            />
            <Button level="primary" onPress={onSignOut} text={t( "Sign-out" )} />
          </Dialog.Actions>
        </Dialog>
      </Portal>
      {/* TODO: figure out how to account for safe area views with h-screen,
      maybe something along these lines: https://github.com/mvllow/tailwindcss-safe-area/blob/70dbef61557b07e26b07a6167e13a377ba3c4625/index.js
      */}
      <View className="self-center justify-center h-screen">
        <Text testID="Login.loggedInAs">{t( "Logged-in-as", { username } )}</Text>
        <Button
          level="primary"
          style={viewStyles.button}
          onPress={showDialog}
          testID="Login.signOutButton"
          text="Sign-out"
        />
      </View>
    </>
  );
};

export default Logout;
