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
import { Heading4 } from "components/SharedComponents";
import PermissionGateContainer, {
  AUDIO_PERMISSIONS,
  CAMERA_PERMISSIONS,
  LOCATION_PERMISSIONS,
  READ_MEDIA_PERMISSIONS
} from "components/SharedComponents/PermissionGateContainer";
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

const addIDTitle = ( ) => <Heading4>{t( "ADD-AN-ID" )}</Heading4>;

const Stack = createNativeStackNavigator( );

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
    image={require( "images/viviana-rishe-j2330n6bg3I-unsplash.jpg" )}
  >
    <SoundRecorder />
  </PermissionGateContainer>
);

const PhotoGalleryWithPermission = ( ) => (
  <PermissionGateContainer
    permissions={READ_MEDIA_PERMISSIONS}
    title={t( "Observe-and-identify-organisms-from-your-gallery" )}
    titleDenied={t( "Please-Allow-Gallery-Access" )}
    body={t( "Upload-photos-from-your-gallery-and-create-observations" )}
    blockedPrompt={t( "Youve-previously-denied-gallery-permissions" )}
    buttonText={t( "CHOOSE-PHOTOS" )}
    icon="gallery"
    image={require( "images/azmaan-baluch-_ra6NcejHVs-unsplash.jpg" )}
  >
    <PhotoGallery />
  </PermissionGateContainer>
);

const ObsEditWithPermission = ( ) => (
  <PermissionGateContainer
    permissions={LOCATION_PERMISSIONS}
    title={t( "Get-more-accurate-suggestions-create-useful-data" )}
    titleDenied={t( "Please-allow-Location-Access" )}
    body={t( "iNaturalist-uses-your-location-to-give-you" )}
    blockedPrompt={t( "Youve-previously-denied-location-permissions" )}
    buttonText={t( "USE-LOCATION" )}
    icon="map-marker-outline"
    image={require( "images/landon-parenteau-EEuDMqRYbx0-unsplash.jpg" )}
  >
    <ObsEdit />
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

export default AddObsStackNavigator;
