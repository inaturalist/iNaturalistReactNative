// @flow

import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { HeaderBackButton } from "@react-navigation/elements";

import PhotoGallery from "../components/PhotoLibrary/PhotoGallery";
import ObsEdit from "../components/ObsEdit/ObsEdit";

const Stack = createNativeStackNavigator( );

const screenOptions = {
  headerShown: true
};

const CameraStackNavigation = ( ): React.Node => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="PhotoGallery"
      component={PhotoGallery}
    />
    <Stack.Screen
      name="ObsEdit"
      component={ObsEdit}
    />
  </Stack.Navigator>
);

export default CameraStackNavigation;
