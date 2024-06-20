// @flow

import { Body1, Button } from "components/SharedComponents";
import { SafeAreaView, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import {
  Dialog, Paragraph, Portal
} from "react-native-paper";

import {
  getUsername
} from "./AuthenticationService";

const Logout = ( ) : Node => {
  const [username, setUsername] = useState( null );
  const [visible, setVisible] = useState( false );

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

  return (
    <>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Content>
            <Paragraph>{t( "Are-you-sure-you-want-to-log-out" )}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              level="neutral"
              onPress={hideDialog}
              testID="Login.signOutButton"
              text={t( "Cancel" )}
            />
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
