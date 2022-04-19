// @flow

import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PhotoGallery from "../components/PhotoLibrary/PhotoGallery";
import GroupPhotos from "../components/PhotoLibrary/GroupPhotos";
import ObsEdit from "../components/ObsEdit/ObsEdit";
import SoundRecorder from "../components/SoundRecorder/SoundRecorder";
import NormalCamera from "../components/Camera/NormalCamera";
import CVSuggestions from "../components/ObsEdit/CVSuggestions";
import CustomHeaderWithTranslation from "../components/SharedComponents/CustomHeaderWithTranslation";

const Stack = createNativeStackNavigator( );

const hideHeader = {
  headerShown: false
};

const CameraStackNavigation = ( ): React.Node => (
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
      component={CVSuggestions}
      options={{
        headerTitle: ( props ) => <CustomHeaderWithTranslation {...props} headerText="IDENTIFICATION" />,
        headerShown: true
      }}
    />
  </Stack.Navigator>
);

export default CameraStackNavigation;
