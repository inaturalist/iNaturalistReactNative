// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CameraContainer from "components/Camera/CameraContainer";
import GroupPhotosContainer from "components/PhotoImporter/GroupPhotosContainer";
import PhotoGallery from "components/PhotoImporter/PhotoGallery";
import { Heading4 } from "components/SharedComponents";
import PermissionGateContainer, {
  AUDIO_PERMISSIONS,
  CAMERA_PERMISSIONS
} from "components/SharedComponents/PermissionGateContainer";
import SoundRecorder from "components/SoundRecorder/SoundRecorder";
import { t } from "i18next";
import {
  hideHeader,
  showCustomHeader,
  showHeader
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";

import SharedStackScreens from "./SharedStackScreens";

const Stack = createNativeStackNavigator( );

const soundRecorderTitle = ( ) => (
  <Heading4 className="text-white">{t( "RECORD-NEW-SOUND" )}</Heading4>
);

const CameraContainerWithPermission = ( ) => (
  <PermissionGateContainer
    permissions={CAMERA_PERMISSIONS}
    title={t( "Observe-and-identify-organisms-in-real-time-with-your-camera" )}
    titleDenied={t( "Please allow Camera Access" )}
    body={t( "Use-the-iNaturalist-camera-to-observe" )}
    blockedPrompt={t( "Youve-previously-denied-camera-permissions" )}
    buttonText={t( "OBSERVE-ORGANISMS" )}
    icon="camera"
  >
    <CameraContainer />
  </PermissionGateContainer>
);

const SoundRecorderWithPermission = ( ) => (
  <PermissionGateContainer
    permissions={AUDIO_PERMISSIONS}
    title={t( "Record-organism-sounds-with-the-microphone" )}
    titleDenied={t( "Please-allow-Microphone-Access" )}
    body={t( "Use-your-devices-microphone-to-record" )}
    blockedPrompt={t( "Youve-previously-denied-microphone-permissions" )}
    buttonText={t( "RECORD-SOUND" )}
    icon="microphone"
    image={require( "images/azmaan-baluch-_ra6NcejHVs-unsplash.jpg" )}
  >
    <SoundRecorder />
  </PermissionGateContainer>
);

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
        component={PhotoGallery}
        options={hideHeader}
      />
      <Stack.Screen
        name="GroupPhotos"
        component={GroupPhotosContainer}
        options={{
          ...showHeader,
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
          headerTitle: soundRecorderTitle,
          unmountOnBlur: true,
          headerTintColor: "white",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "black"
          }
        }}
      />
    </Stack.Group>
    {SharedStackScreens( )}
  </Stack.Navigator>
);

export default AddObsStackNavigator;
