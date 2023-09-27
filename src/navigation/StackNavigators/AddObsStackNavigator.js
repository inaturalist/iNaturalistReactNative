// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CameraContainer from "components/Camera/CameraContainer";
import GroupPhotosContainer from "components/PhotoImporter/GroupPhotosContainer";
import PhotoGallery from "components/PhotoImporter/PhotoGallery";
import { Mortal, PermissionGate } from "components/SharedComponents";
import SoundRecorder from "components/SoundRecorder/SoundRecorder";
import { t } from "i18next";
import {
  blankHeaderTitle,
  hideHeader,
  showCustomHeader,
  showHeaderLeft
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { PERMISSIONS } from "react-native-permissions";

import SharedStackScreens from "./SharedStackScreens";

const usesAndroid10Permissions = Platform.OS === "android" && Platform.Version <= 29;
const usesAndroid13Permissions = Platform.OS === "android" && Platform.Version >= 33;

const androidReadPermissions = usesAndroid13Permissions
  ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
  : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

const Stack = createNativeStackNavigator( );

const CameraContainerWithPermission = ( ) => {
  if ( usesAndroid10Permissions ) {
    // WRITE_EXTERNAL_STORAGE is deprecated after Android 10
    // https://developer.android.com/training/data-storage/shared/media#access-other-apps-files
    return (
      <Mortal>
        <PermissionGate
          permission={PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE}
        >
          <PermissionGate permission={PermissionsAndroid.PERMISSIONS.CAMERA}>
            <CameraContainer />
          </PermissionGate>
        </PermissionGate>
      </Mortal>
    );
  }
  return (
    <Mortal>
      <PermissionGate permission={PermissionsAndroid.PERMISSIONS.CAMERA}>
        <CameraContainer />
      </PermissionGate>
    </Mortal>
  );
};

const SoundRecorderWithPermission = ( ) => {
  if ( usesAndroid10Permissions ) {
    return (
      <PermissionGate permission={PermissionsAndroid.PERMISSIONS.RECORD_AUDIO}>
        <PermissionGate
          permission={PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE}
        >
          <PermissionGate
            permission={androidReadPermissions}
          >
            <SoundRecorder />
          </PermissionGate>
        </PermissionGate>
      </PermissionGate>
    );
  }
  return (
    <PermissionGate permission={PermissionsAndroid.PERMISSIONS.RECORD_AUDIO}>
      <PermissionGate
        permission={androidReadPermissions}
      >
        <SoundRecorder />
      </PermissionGate>
    </PermissionGate>
  );
};

const PhotoGalleryWithPermission = ( ) => {
  if ( usesAndroid10Permissions ) {
    return (
      <PermissionGate
        permission={androidReadPermissions}
      >
        <PermissionGate
          permission={PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE}
        >
          <PermissionGate
            permission={PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION}
          >
            <PhotoGallery />
          </PermissionGate>
        </PermissionGate>
      </PermissionGate>
    );
  }

  return (
    <PermissionGate permission={androidReadPermissions}>
      <PermissionGate
        permission={PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION}
      >
        <PermissionGate permission={PERMISSIONS.IOS.PHOTO_LIBRARY} isIOS>
          <PermissionGate
            permission={PERMISSIONS.IOS.LOCATION_WHEN_IN_USE}
            isIOS
          >
            <PhotoGallery />
          </PermissionGate>
        </PermissionGate>
      </PermissionGate>
    </PermissionGate>
  );
};

const AddObsStackNavigator = ( ): Node => (
  <Stack.Navigator
    screenOptions={{
      headerBackTitleVisible: false,
      headerTintColor: "black",
      contentStyle: {
        backgroundColor: "white"
      }
    }}
  >
    <Stack.Group>
      <Stack.Screen
        name="Camera"
        component={CameraContainerWithPermission}
        options={{
          ...hideHeader,
          orientation: "all",
          unmountOnBlur: true,
          contentStyle: {
            backgroundColor: "black"
          }
        }}
      />
      <Stack.Screen
        name="PhotoGallery"
        component={PhotoGalleryWithPermission}
        options={blankHeaderTitle}
      />
      <Stack.Screen
        name="GroupPhotos"
        component={GroupPhotosContainer}
        options={{
          ...showHeaderLeft,
          ...showCustomHeader,
          lazy: true,
          title: t( "Group-Photos" ),
          headerShadowVisible: false
        }}
      />
      <Stack.Screen
        name="SoundRecorder"
        component={SoundRecorderWithPermission}
        options={{
          title: t( "Record-new-sound" )
        }}
      />
    </Stack.Group>
    {SharedStackScreens( )}
  </Stack.Navigator>
);

export default AddObsStackNavigator;
