// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AddIDContainer from "components/AddID/AddIDContainer";
import CameraContainer from "components/Camera/CameraContainer";
import LocationPickerContainer from "components/LocationPicker/LocationPickerContainer";
import MediaViewer from "components/MediaViewer/MediaViewer";
import ObsEdit from "components/ObsEdit/ObsEdit";
import GroupPhotosContainer from "components/PhotoImporter/GroupPhotosContainer";
import PhotoGallery from "components/PhotoImporter/PhotoGallery";
import { Heading4, Mortal, PermissionGate } from "components/SharedComponents";
import SoundRecorder from "components/SoundRecorder/SoundRecorder";
import { t } from "i18next";
import {
  blankHeaderTitle,
  hideHeader,
  hideHeaderLeft,
  removeBottomBorder,
  showCustomHeader,
  showHeaderLeft
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { PERMISSIONS } from "react-native-permissions";

const addIDTitle = ( ) => <Heading4>{t( "ADD-AN-ID" )}</Heading4>;

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
      <PermissionGate
        permission={PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE}
      >
        <PermissionGate permission={PermissionsAndroid.PERMISSIONS.CAMERA}>
          <CameraContainer />
        </PermissionGate>
      </PermissionGate>
    );
  }
  return (
    <PermissionGate permission={PermissionsAndroid.PERMISSIONS.CAMERA}>
      <CameraContainer />
    </PermissionGate>
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

const ObsEditWithPermission = ( ) => (
  <Mortal>
    <PermissionGate
      permission={PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION}
    >
      <ObsEdit />
    </PermissionGate>
  </Mortal>
);

const CameraStackNavigator = ( ): Node => (
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
          title: t( "Group-Photos" )
        }}
      />
      <Stack.Screen
        name="SoundRecorder"
        component={SoundRecorderWithPermission}
        options={{
          title: t( "Record-new-sound" )
        }}
      />
      <Stack.Screen
        name="ObsEdit"
        component={ObsEditWithPermission}
        options={{
          ...removeBottomBorder,
          ...blankHeaderTitle,
          headerBackVisible: false
        }}
      />
      <Stack.Screen
        name="AddID"
        component={AddIDContainer}
        options={{
          ...removeBottomBorder,
          headerTitle: addIDTitle
        }}
      />
      <Stack.Screen
        name="LocationPicker"
        component={LocationPickerContainer}
        options={hideHeader}
      />
      <Stack.Screen
        name="MediaViewer"
        component={MediaViewer}
        options={{
          ...blankHeaderTitle,
          headerStyle: {
            backgroundColor: "black"
          },
          ...hideHeaderLeft
        }}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default CameraStackNavigator;
