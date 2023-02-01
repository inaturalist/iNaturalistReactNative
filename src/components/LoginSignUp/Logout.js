// @flow

import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "components/SharedComponents";
import { Pressable, SafeAreaView, View } from "components/styledComponents";
import { t } from "i18next";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import {
  Dialog, Paragraph, Portal, Text
} from "react-native-paper";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

import { log } from "../../../react-native-logs.config";
import {
  getUsername,
  signOut
} from "./AuthenticationService";

const logger = log.extend( "Logout" );

const { useRealm } = RealmContext;

const Logout = ( ): Node => {
  const navigation = useNavigation( );
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
    logger.info( `Signing out ${username || ""} at the request of the user` );
    await signOut( { realm, clearRealm: true, queryClient } );
    // TODO might be necessary to restart the app at this point. We just
    // deleted the realm file on disk, but the RealmProvider may still have a
    // copy of realm in local state
    navigation.navigate( "MainStack", {
      screen: "ObsList"
    } );
  };

  const renderBackButton = ( ) => (
    <Pressable
      onPress={( ) => navigation.goBack( )}
      className="absolute top-8 right-8"
    >
      <IconMaterial name="close" size={35} />
    </Pressable>
  );

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
            <Button level="focus" onPress={onSignOut} text={t( "Sign-out" )} />
          </Dialog.Actions>
        </Dialog>
      </Portal>
      {/* TODO: figure out how to account for safe area views with h-screen,
      maybe something along these lines: https://github.com/mvllow/tailwindcss-safe-area/blob/70dbef61557b07e26b07a6167e13a377ba3c4625/index.js
      */}
      <SafeAreaView>
        {renderBackButton( )}
        <View className="self-center justify-center h-screen">
          <Text testID="Login.loggedInAs">{t( "Logged-in-as", { username } )}</Text>
          <Button
            level="focus"
            className="mt-5"
            onPress={showDialog}
            testID="Login.signOutButton"
            text={t( "Sign-out" )}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default Logout;
