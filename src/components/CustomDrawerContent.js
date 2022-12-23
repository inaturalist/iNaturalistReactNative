// @flow

import {
  DrawerContentScrollView,
  DrawerItem
} from "@react-navigation/drawer";
import type { Node } from "react";
import React from "react";
import useCurrentUser from "sharedHooks/useCurrentUser";

type Props = {
  state: any,
  navigation: any,
  descriptors: any
}

const CustomDrawerContent = ( { ...props }: Props ): Node => {
  // $FlowFixMe
  const { state, navigation, descriptors } = props;
  const currentUser = useCurrentUser( );

  return (
    <DrawerContentScrollView state={state} navigation={navigation} descriptors={descriptors}>
      <DrawerItem
        label="search"
        onPress={( ) => navigation.navigate( "search" )}
      />
      <DrawerItem
        label="identify"
        onPress={( ) => navigation.navigate( "identify" )}
      />
      <DrawerItem
        label="projects"
        onPress={( ) => navigation.navigate( "projects" )}
      />
      <DrawerItem
        label="about"
        onPress={( ) => navigation.navigate( "about" )}
      />
      <DrawerItem
        label="settings"
        onPress={( ) => navigation.navigate( "settings" )}
      />
      <DrawerItem
        label="network/logging"
        onPress={( ) => navigation.navigate( "network" )}
      />
      <DrawerItem
        label={currentUser ? "logout" : "login"}
        onPress={( ) => navigation.navigate( "login" )}
      />
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
