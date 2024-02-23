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

export const WRITE_MEDIA_PERMISSIONS: Array<string> = Platform.OS === "ios"
  ? [PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY]
  : androidReadPermissions;

export const LOCATION_PERMISSIONS: Array<string> = Platform.OS === "ios"
  ? [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]
  : [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];

type Props = {
  blockedPrompt?: string,
  body?: string,
  buttonText?: string,
  children?: Node,
  icon?: string,
  image?: Object,
  onPermissionBlocked?: Function,
  onPermissionDenied?: Function,
  onPermissionGranted?: Function,
  permissionNeeded?: boolean,
  permissions: Array<string>,
  setModalWasClosed?: Function,
  testID?: string,
  title?: string,
  titleDenied: string,
  withoutNavigation?: boolean
};

export function permissionResultFromMultiple( multiResults: Object ): string {
  if ( typeof ( multiResults ) !== "object" ) {
    throw new Error(
      "permissionResultFromMultiple received something other than an object. "
      + "Make sure you're using it with checkMultiple and not check"
    );
  }
  if ( _.find( multiResults, ( permResult, _perm ) => permResult === RESULTS.BLOCKED ) ) {
    return RESULTS.BLOCKED;
  }
  if ( _.find( multiResults, ( permResult, _perm ) => permResult === RESULTS.DENIED ) ) {
    return RESULTS.DENIED;
  }
  if ( _.find( multiResults, ( permResult, _perm ) => permResult === RESULTS.UNAVAILABLE ) ) {
    return RESULTS.UNAVAILABLE;
  }
  return RESULTS.GRANTED;
}

// Prompts the user for an Android permission and renders children if granted.
// Otherwise renders a view saying that permission is required, with a button
// to grant it if the user hasn't asked not to be bothered again. In the
// future we might want to extend this to always show a custom view before
// asking the user for a permission.
const PermissionGateContainer = ( {
  blockedPrompt,
  body,
  buttonText,
  children,
  icon,
  image,
  onPermissionBlocked,
  onPermissionDenied,
  onPermissionGranted,
  permissionNeeded = true,
  permissions,
  setModalWasClosed,
  testID,
  title,
  titleDenied,
  withoutNavigation
}: Props ): Node => {
  const [result, setResult] = useState( null );
  const [modalShown, setModalShown] = useState( false );

  const navigation = useNavigation();

  const requestPermission = useCallback( async ( ) => {
    const requestResult = await requestMultiple( permissions );
    setResult( permissionResultFromMultiple( requestResult ) );
  }, [permissions] );

  const checkPermission = useCallback( async ( ) => {
    const checkResult = await checkMultiple( permissions );
    setResult( permissionResultFromMultiple( checkResult ) );
  }, [permissions] );

  useEffect( () => {
    if ( result === null && permissionNeeded ) {
      checkPermission( );
    }
  }, [checkPermission, result, permissionNeeded] );

  useEffect( ( ) => {
    if (
      permissionNeeded
      && result !== RESULTS.GRANTED
      && result !== null
    ) {
      setModalShown( true );
      return () => {};
    }
    if ( !withoutNavigation ) {
      const unsubscribe = navigation.addListener( "focus", async () => {
        await checkPermission( );
        setModalShown( true );
      } );
      return unsubscribe;
    }
    return () => {};
  }, [
    checkPermission,
    children,
    navigation,
    permissionNeeded,
    result,
    withoutNavigation
  ] );

  useEffect( ( ) => {
    if ( result === RESULTS.GRANTED && !children ) {
      setModalShown( false );
    }
  }, [result, children, setModalShown] );

  const closeModal = useCallback( ( ) => {
    setModalShown( false );
    if ( setModalWasClosed ) {
      setModalWasClosed( true );
    }
    if ( !withoutNavigation ) navigation.goBack( );
  }, [
    navigation,
    setModalShown,
    withoutNavigation,
    setModalWasClosed
  ] );

  // If the result changes, notify the parent component
  useEffect( ( ) => {
    if ( onPermissionDenied && result === RESULTS.DENIED ) {
      onPermissionDenied( );
    } else if ( onPermissionGranted && result === RESULTS.GRANTED ) {
      onPermissionGranted( );
    } else if ( onPermissionBlocked && result === RESULTS.BLOCKED ) {
      onPermissionBlocked( );
    }
  }, [
    onPermissionBlocked,
    onPermissionDenied,
    onPermissionGranted,
    result
  ] );

  // If permission was granted, just render the children
  if ( result === RESULTS.GRANTED && children ) return children;

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
          testID={testID}
        />
      )}
    />
  );
};

export default PermissionGateContainer;
