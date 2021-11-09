// @flow

import * as React from "react";
// import { Text } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
// import fbt from "fbt";

import ObsList from "../components/Observations/ObsList";

// this removes the default hamburger menu from header
const screenOptions = { headerLeft: ( ) => <></> };

const Drawer = createDrawerNavigator();

// const FBTExampleTitle = ( ) => (
//   <Text>
//     <fbt project="foo" desc="a simple example">
//       obs header!!
//     </fbt>
//   </Text>
// );

const DrawerNavigator = ( ): React.Node => (
  <Drawer.Navigator screenOptions={screenOptions}>
    <Drawer.Screen
      name="my observations"
      component={ObsList}
      // options={{ headerTitle: ( props ) => <FBTExampleTitle {...props} /> }}
     />
  </Drawer.Navigator>
);

export default DrawerNavigator;
