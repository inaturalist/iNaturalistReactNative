// @flow

import {
  DrawerContentScrollView,
  DrawerItem
} from "@react-navigation/drawer";
import type { Node } from "react";
import React from "react";

type Props = {
  state: any,
  navigation: any,
  descriptors: any
}

const CustomDrawerContent = ( { ...props }: Props ): Node => {
  // $FlowFixMe
  const { state, navigation, descriptors } = props;

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
        label="help"
        onPress={( ) => console.log( "nav to help/tutorials" )}
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
        label="login"
        onPress={( ) => navigation.navigate( "login" )}
      />
      <DrawerItem
        label="repositoryTest"
        onPress={( ) => navigation.navigate( "RepositoryTest" )}
      />
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
