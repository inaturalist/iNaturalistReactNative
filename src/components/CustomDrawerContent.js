// @flow

import React from "react";
import {
  DrawerContentScrollView,
  DrawerItem
} from "@react-navigation/drawer";
import type { Node } from "react";

type Props = {
  props: any
}

const CustomDrawerContent = ( { ...props }: Props ): Node => {
  // $FlowFixMe
  const { navigation } = props;

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="identify"
        onPress={( ) => console.log( "nav to identify" )}
      />
      <DrawerItem
        label="search"
        onPress={( ) => navigation.navigate( "search" )}
      />
      <DrawerItem
        label="messages"
        onPress={( ) => navigation.navigate( "messages" )}
      />
      <DrawerItem
        label="settings"
        onPress={( ) => console.log( "nav to settings" )}
      />
      <DrawerItem
        label="following"
        onPress={( ) => console.log( "nav to following" )}
      />
      <DrawerItem
        label="about"
        onPress={( ) => console.log( "nav to about" )}
      />
      <DrawerItem
        label="help/tutorials"
        onPress={( ) => console.log( "nav to help/tutorials" )}
      />
      <DrawerItem
        label="login"
        onPress={( ) => navigation.navigate( "login" )}
      />
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
