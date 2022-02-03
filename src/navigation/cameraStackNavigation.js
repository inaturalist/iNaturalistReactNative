// @flow

import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { HeaderBackButton } from "@react-navigation/elements";

import PhotoGallery from "../components/PhotoLibrary/PhotoGallery";
import GroupPhotos from "../components/PhotoLibrary/GroupPhotos";
import ObsEdit from "../components/ObsEdit/ObsEdit";
import PhotoGalleryProvider from "../providers/PhotoGalleryProvider";

const Stack = createNativeStackNavigator( );

const hideHeader = {
  headerShown: false
};

const CameraStackNavigation = ( ): React.Node => (
  <PhotoGalleryProvider>
    <Stack.Navigator screenOptions={hideHeader}>
      <Stack.Screen
        name="PhotoGallery"
        component={PhotoGallery}
      />
      <Stack.Screen
        name="GroupPhotos"
        component={GroupPhotos}
      />
      <Stack.Screen
        name="ObsEdit"
        component={ObsEdit}
      />
    </Stack.Navigator>
  </PhotoGalleryProvider>
);

export default CameraStackNavigation;
