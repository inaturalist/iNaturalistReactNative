// @flow

import * as React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useTranslation } from "react-i18next";

import ObsList from "../components/Observations/ObsList";

// this removes the default hamburger menu from header
const screenOptions = { headerLeft: ( ) => <></> };

const Drawer = createDrawerNavigator();

const DrawerNavigator = ( ): React.Node => {
  const { t } = useTranslation( );

  return (
    <Drawer.Navigator screenOptions={screenOptions}>
      <Drawer.Screen
        name="my observations"
        component={ObsList}
        options={{ headerTitle: t( "my_observations_caps" ) }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
