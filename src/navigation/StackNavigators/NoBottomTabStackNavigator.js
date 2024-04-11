// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CameraContainer from "components/Camera/CameraContainer";
import ForgotPassword from "components/LoginSignUp/ForgotPassword";
import LicensePhotos from "components/LoginSignUp/LicensePhotos";
import Login from "components/LoginSignUp/Login";
import SignUp from "components/LoginSignUp/SignUp";
import SignUpConfirmation from "components/LoginSignUp/SignUpConfirmation";
import GroupPhotosContainer from "components/PhotoImporter/GroupPhotosContainer";
import PhotoGallery from "components/PhotoImporter/PhotoGallery";
import { CloseButton, Heading4 } from "components/SharedComponents";
import Mortal from "components/SharedComponents/Mortal";
import PermissionGateContainer, {
  AUDIO_PERMISSIONS,
  CAMERA_PERMISSIONS
} from "components/SharedComponents/PermissionGateContainer";
import SoundRecorder from "components/SoundRecorder/SoundRecorder";
import { t } from "i18next";
import {
  hideHeader,
  hideHeaderLeft,
  showCustomHeader,
  showHeader
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";

import SharedStackScreens from "./SharedStackScreens";

const Stack = createNativeStackNavigator( );

const LoginCloseButton = ( ) => (
  <CloseButton
    handleClose={navigation => navigation.getParent( )?.goBack( )}
    buttonClassName="mr-[-15px]"
  />
);

const LOGIN_SCREEN_OPTIONS = {
  headerTitle: "",
  headerTransparent: true,
  headerTintColor: "white",
  contentStyle: {
    backgroundColor: "black"
  },
  headerRight: LoginCloseButton
};

const soundRecorderTitle = ( ) => (
  <Heading4 className="text-white">{t( "RECORD-NEW-SOUND" )}</Heading4>
);

const CameraContainerWithPermission = ( ) => (
  <PermissionGateContainer
    permissions={CAMERA_PERMISSIONS}
    title={t( "Observe-and-identify-organisms-in-real-time-with-your-camera" )}
    titleDenied={t( "Please-allow-Camera-Access" )}
    body={t( "Use-the-iNaturalist-camera-to-observe" )}
    blockedPrompt={t( "Youve-previously-denied-camera-permissions" )}
    buttonText={t( "OBSERVE-ORGANISMS" )}
    icon="camera"
  >
    <CameraContainer />
  </PermissionGateContainer>
);

const SoundRecorderWithPermission = ( ) => (
  <Mortal>
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
  </Mortal>
);

const NoBottomTabStackNavigator = ( ): Node => (
  <Stack.Navigator
    screenOptions={{
      headerBackTitleVisible: false,
      headerTintColor: "black",
      contentStyle: {
        backgroundColor: "white"
      }
    }}
  >
    {/* Add Observation Stack Group */}
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
    {/* Login Stack Group */}
    <Stack.Group
      screenOptions={LOGIN_SCREEN_OPTIONS}
    >
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          ...hideHeaderLeft
        }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUp}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
      />
      <Stack.Screen
        name="LicensePhotos"
        component={LicensePhotos}
      />
      <Stack.Screen
        name="SignUpConfirmation"
        component={SignUpConfirmation}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default NoBottomTabStackNavigator;
