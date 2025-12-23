// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// Please don't change this to an aliased path or the e2e mock will not get
// used in our e2e tests on Github Actions
// eslint-disable-next-line import/no-unresolved
import CameraContainer from "components/Camera/CameraContainer";
import GroupPhotosContainer from "components/PhotoImporter/GroupPhotosContainer";
import PhotoLibrary from "components/PhotoImporter/PhotoLibrary";
import { Heading4 } from "components/SharedComponents";
import Mortal from "components/SharedComponents/Mortal";
import PermissionGateContainer, {
  AUDIO_PERMISSIONS,
  CAMERA_PERMISSIONS,
} from "components/SharedComponents/PermissionGateContainer";
import SoundRecorder from "components/SoundRecorder/SoundRecorder";
import { t } from "i18next";
import ContextHeader from "navigation/ContextHeader";
import {
  fadeInComponent,
  hideHeader,
  hideHeaderLeft,
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";

import SharedStackScreens from "./SharedStackScreens";

const Stack = createNativeStackNavigator( );

const soundRecorderTitle = () => (
  <Heading4 className="text-white" accessibilityRole="header" numberOfLines={1}>
    {t( "RECORD-NEW-SOUND" )}
  </Heading4>
);

const CAMERA_SCREEN_OPTIONS = {
  ...hideHeader,
  contentStyle: {
    backgroundColor: "black",
  },
};

const GROUP_PHOTOS_OPTIONS = {
  header: ContextHeader,
  alignStart: true,
  lazy: true,
};

const SOUND_RECORDER_OPTIONS = {
  ...hideHeaderLeft,
  headerStyle: {
    backgroundColor: "black",
  },
  headerTintColor: "white",
  headerTitle: soundRecorderTitle,
  headerTitleAlign: "center",
};

const CameraContainerWithPermission = ( ) => fadeInComponent(
  <Mortal>
    <PermissionGateContainer
      permissions={CAMERA_PERMISSIONS}
      title={t( "Identify-organisms-in-real-time-with-your-camera" )}
      titleDenied={t( "Please-allow-Camera-Access" )}
      body={t( "Use-the-iNaturalist-camera-to-see-real-time-identifications-and-take-photos" )}
      blockedPrompt={t( "Youve-previously-denied-camera-permissions" )}
      buttonText={t( "OBSERVE-ORGANISMS" )}
      icon="camera"
      image={require( "images/background/viviana-rishe-j2330n6bg3I-unsplash.jpg" )}
    >
      <CameraContainer />
    </PermissionGateContainer>
  </Mortal>,
);

// On iOS we don't actually need PHOTO LIBRARY permission to import photos,
// and in fact, if we ask for it and the user denies it after already
// granting add-only permission, the user can never grant it again until they
// uninstall the app. We *may* want to bring this back to handle writing to
// albums, but for now this works. ~~~~kueda20240829

// TODO verify this is true for Android
const PhotoLibraryContainerWithPermission = ( ) => (
  <PhotoLibrary />
);

const SoundRecorderWithPermission = ( ) => fadeInComponent(
  <Mortal>
    <PermissionGateContainer
      permissions={AUDIO_PERMISSIONS}
      title={t( "Record-animal-sounds" )}
      titleDenied={t( "Please-allow-Microphone-Access" )}
      body={t( "Use-your-devices-microphone-to-record-animal-sounds-and-share-them" )}
      blockedPrompt={t( "Youve-previously-denied-microphone-permissions" )}
      buttonText={t( "RECORD-SOUND" )}
      icon="microphone"
      image={require( "images/background/azmaan-baluch-_ra6NcejHVs-unsplash.jpg" )}
    >
      <SoundRecorder />
    </PermissionGateContainer>
  </Mortal>,
);

const NoBottomTabStackNavigator = ( ): Node => (
  <Stack.Navigator
    screenOptions={{
      headerBackButtonDisplayMode: "minimal",
      contentStyle: {
        backgroundColor: "white",
      },
    }}
  >
    {/* Add Observation Stack Group */}
    <Stack.Group>
      <Stack.Screen
        name="Camera"
        component={CameraContainerWithPermission}
        options={CAMERA_SCREEN_OPTIONS}
      />
      <Stack.Screen
        name="PhotoLibrary"
        component={PhotoLibraryContainerWithPermission}
        options={hideHeader}
      />
      <Stack.Screen
        name="GroupPhotos"
        component={GroupPhotosContainer}
        options={GROUP_PHOTOS_OPTIONS}
      />
      <Stack.Screen
        name="SoundRecorder"
        component={SoundRecorderWithPermission}
        options={SOUND_RECORDER_OPTIONS}
      />
    </Stack.Group>
    {SharedStackScreens( )}
  </Stack.Navigator>
);

export default NoBottomTabStackNavigator;
