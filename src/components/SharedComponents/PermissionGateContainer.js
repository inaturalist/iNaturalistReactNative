// @flow

import { useNavigation } from "@react-navigation/native";
import Modal from "components/SharedComponents/Modal";
import _ from "lodash";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import {
  checkMultiple, PERMISSIONS, requestMultiple, RESULTS
} from "react-native-permissions";

import PermissionGate from "./PermissionGate";

const usesAndroid10Permissions = Platform.OS === "android" && Platform.Version <= 29;
const usesAndroid13Permissions = Platform.OS === "android" && Platform.Version >= 33;

let androidReadPermissions = [
  PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION
];
if ( usesAndroid10Permissions ) {
  androidReadPermissions = [...androidReadPermissions, PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE];
} else if ( usesAndroid13Permissions ) {
  androidReadPermissions = [...androidReadPermissions, PERMISSIONS.ANDROID.READ_MEDIA_IMAGES];
} else {
  androidReadPermissions = [...androidReadPermissions, PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE];
}

const androidCameraPermissions = usesAndroid10Permissions
  ? [PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE]
  : [PERMISSIONS.ANDROID.CAMERA];

export const CAMERA_PERMISSIONS: Array<string> = Platform.OS === "ios"
  ? [PERMISSIONS.IOS.CAMERA]
  : androidCameraPermissions;

export const AUDIO_PERMISSIONS: Array<string> = Platform.OS === "ios"
  ? [PERMISSIONS.IOS.MICROPHONE]
  : [...androidReadPermissions, PERMISSIONS.ANDROID.RECORD_AUDIO];

export const READ_MEDIA_PERMISSIONS: Array<string> = Platform.OS === "ios"
  ? [PERMISSIONS.IOS.PHOTO_LIBRARY]
  : androidReadPermissions;

export const LOCATION_PERMISSIONS: Array<string> = Platform.OS === "ios"
  ? [
    PERMISSIONS.IOS.LOCATION_ACCURACY,
    PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
  ]
  : [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];

type Props = {
  children: Node,
  permissions: Array<string>,
  icon?: string,
  title?: string,
  titleDenied: string,
  body?: string,
  blockedPrompt?: string,
  buttonText?: string,
  image?: Object
};

// Prompts the user for an Android permission and renders children if granted.
// Otherwise renders a view saying that permission is required, with a button
// to grant it if the user hasn't asked not to be bothered again. In the
// future we might want to extend this to always show a custom view before
// asking the user for a permission.
const PermissionGateContainer = ( {
  children,
  permissions,
  icon,
  title,
  titleDenied,
  body,
  blockedPrompt,
  buttonText,
  image
}: Props ): Node => {
  const [result, setResult] = useState( null );
  const [modalShown, setModalShown] = useState( true );

  const navigation = useNavigation();

  console.log( "result: ", result );

  const setResultFromMultiple = useCallback( multiResults => {
    if ( _.find( multiResults, ( permResult, _perm ) => permResult === RESULTS.BLOCKED ) ) {
      setResult( RESULTS.BLOCKED );
      return;
    }
    if ( _.find( multiResults, ( permResult, _perm ) => permResult === RESULTS.DENIED ) ) {
      setResult( RESULTS.DENIED );
      return;
    }
    if ( _.find( multiResults, ( permResult, _perm ) => permResult === RESULTS.UNAVAILABLE ) ) {
      setResult( RESULTS.UNAVAILABLE );
      return;
    }
    setResult( RESULTS.GRANTED );
  }, [setResult] );

  const requestPermission = useCallback( async ( ) => {
    const requestResult = await requestMultiple( permissions );
    setResultFromMultiple( requestResult );
  }, [permissions, setResultFromMultiple] );

  const checkPermission = useCallback( async ( ) => {
    const checkResult = await checkMultiple( permissions );
    setResultFromMultiple( checkResult );
  }, [permissions, setResultFromMultiple] );

  useEffect( () => {
    if ( result === null ) {
      checkPermission( );
    }
  }, [checkPermission, result] );

  useEffect( ( ) => {
    const unsubscribe = navigation.addListener( "focus", async () => {
      await checkPermission( );
      setModalShown( true );
    } );
    return unsubscribe;
  }, [checkPermission, navigation] );

  const closeModal = useCallback( ( ) => {
    setModalShown( false );
    navigation.goBack( );
  }, [setModalShown, navigation] );

  if ( result === RESULTS.GRANTED ) {
    return children;
  }
  if ( !result ) return null;

  return (
    <Modal
      showModal={modalShown}
      closeModal={closeModal}
      fullScreen
      modal={(
        <PermissionGate
          requestPermission={requestPermission}
          grantStatus={result}
          icon={icon}
          title={title}
          titleDenied={titleDenied}
          body={body}
          blockedPrompt={blockedPrompt}
          buttonText={buttonText}
          image={image}
          onClose={closeModal}
        />
      )}
    />
  );
};

export default PermissionGateContainer;
