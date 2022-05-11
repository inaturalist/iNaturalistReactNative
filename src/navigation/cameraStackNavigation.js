// @flow

import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PermissionsAndroid } from "react-native";

import GroupPhotos from "../components/PhotoLibrary/GroupPhotos";
import ObsEdit from "../components/ObsEdit/ObsEdit";
import SoundRecorder from "../components/SoundRecorder/SoundRecorder";
import NormalCamera from "../components/Camera/NormalCamera";
import CVSuggestions from "../components/ObsEdit/CVSuggestions";
import CustomHeaderWithTranslation from "../components/SharedComponents/CustomHeaderWithTranslation";
import PhotoGalleryProvider from "../providers/PhotoGalleryProvider";
import PhotoGallery from "../components/PhotoLibrary/PhotoGallery";
import PermissionGate from "../components/SharedComponents/PermissionGate";

const Stack = createNativeStackNavigator( );

const hideHeader = {
  headerShown: false
};

const PhotoGalleryWithPermission = ( ) => (
  <PermissionGate permission={PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE}>
    <PermissionGate permission={PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE}>
      <PhotoGallery />
    </PermissionGate>
  </PermissionGate>
);

const NormalCameraWithPermission = ( ) => (
  <PermissionGate permission={PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE}>
    <PermissionGate permission={PermissionsAndroid.PERMISSIONS.CAMERA}>
      <NormalCamera />
    </PermissionGate>
  </PermissionGate>
);

const SoundRecorderWithPermission = ( ) => (
  <PermissionGate permission={PermissionsAndroid.PERMISSIONS.RECORD_AUDIO}>
    <PermissionGate permission={PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE}>
      <PermissionGate permission={PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE}>
        <SoundRecorder />
      </PermissionGate>
    </PermissionGate>
  </PermissionGate>
);

const CameraStackNavigation = ( ): React.Node => (
  <PhotoGalleryProvider>
    <Stack.Navigator screenOptions={hideHeader}>
      <Stack.Screen
        name="PhotoGallery"
        component={PhotoGalleryWithPermission}
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
        component={SoundRecorderWithPermission}
      />
      <Stack.Screen
        name="NormalCamera"
        component={NormalCameraWithPermission}
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
  </PhotoGalleryProvider>
);

export default CameraStackNavigation;
