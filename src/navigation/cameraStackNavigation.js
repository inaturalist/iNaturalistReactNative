// @flow

import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { HeaderBackButton } from "@react-navigation/elements";

import PhotoGallery from "../components/PhotoLibrary/PhotoGallery";
import GroupPhotos from "../components/PhotoLibrary/GroupPhotos";
import ObsEdit from "../components/ObsEdit/ObsEdit";
import PhotoGalleryProvider from "../providers/PhotoGalleryProvider";
import SoundRecorder from "../components/SoundRecorder/SoundRecorder";
import NormalCamera from "../components/Camera/NormalCamera";
import ObsEditProvider from "../providers/ObsEditProvider";
import TaxaSuggestions from "../components/ObsEdit/TaxaSuggestions";

const Stack = createNativeStackNavigator( );

const hideHeader = {
  headerShown: false
};

const CameraStackNavigation = ( ): React.Node => (
  <ObsEditProvider>
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
        <Stack.Screen
          name="SoundRecorder"
          component={SoundRecorder}
        />
        <Stack.Screen
          name="NormalCamera"
          component={NormalCamera}
        />
        <Stack.Screen
          name="Suggestions"
          component={TaxaSuggestions}
        />
      </Stack.Navigator>
    </PhotoGalleryProvider>
  </ObsEditProvider>
);

export default CameraStackNavigation;
