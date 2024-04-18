// @flow

import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { Body1, Button } from "components/SharedComponents";
import { SafeAreaView, View } from "components/styledComponents";
import { t } from "i18next";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import {
  Dialog, Paragraph, Portal
} from "react-native-paper";

import { log } from "../../../react-native-logs.config";
import {
  getUsername,
  signOut
} from "./AuthenticationService";

const logger = log.extend( "Logout" );

const { useRealm } = RealmContext;

type Props = {
  onLogOut?: ( ) => void
}

const Logout = ( { onLogOut }: Props ) : Node => {
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
    if ( typeof ( onLogOut ) === "function" ) {
      onLogOut( );
    }
    hideDialog( );

    // TODO might be necessary to restart the app at this point. We just
    // deleted the realm file on disk, but the RealmProvider may still have a
    // copy of realm in local state
    navigation.getParent( )?.goBack( );
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
            <Button level="focus" onPress={onSignOut} text={t( "Sign-out" )} />
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <SafeAreaView>
        <View className="self-center justify-center h-full">
          <Body1 className="text-white" testID="Login.loggedInAs">
            {t( "Logged-in-as", { username } )}
          </Body1>
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
