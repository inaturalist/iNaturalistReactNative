import { useNavigation } from "@react-navigation/native";
import Modal from "components/SharedComponents/Modal.tsx";
import _ from "lodash";
import React, {
  JSX,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState
} from "react";
import { Platform } from "react-native";
import {
  AndroidPermission,
  checkMultiple,
  Permission,
  PERMISSIONS,
  PermissionStatus,
  requestMultiple,
  RESULTS
} from "react-native-permissions";

import PermissionGate from "./PermissionGate";

const usesAndroid10Permissions = Platform.OS === "android" && Platform.Version <= 29;
const usesAndroid13Permissions = Platform.OS === "android" && Platform.Version >= 33;

let androidReadWritePermissions: AndroidPermission[] = [
  PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION
];
if ( usesAndroid10Permissions ) {
  androidReadWritePermissions = [
    ...androidReadWritePermissions,
    PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
  ];
} else if ( usesAndroid13Permissions ) {
  androidReadWritePermissions = [
    ...androidReadWritePermissions,
    PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
  ];
} else {
  androidReadWritePermissions = [
    ...androidReadWritePermissions,
    PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
  ];
}

// TODO does this really work for Android above 10?
let androidWritePermissions: AndroidPermission[] = [];
if ( usesAndroid10Permissions ) {
  androidWritePermissions = [
    ...androidWritePermissions,
    PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
  ];
}

const androidCameraPermissions = usesAndroid10Permissions
  ? [PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE]
  : [PERMISSIONS.ANDROID.CAMERA];

export const CAMERA_PERMISSIONS = Platform.OS === "ios"
  ? [PERMISSIONS.IOS.CAMERA]
  : androidCameraPermissions;

export const AUDIO_PERMISSIONS = Platform.OS === "ios"
  ? [PERMISSIONS.IOS.MICROPHONE]
  : [...androidReadWritePermissions, PERMISSIONS.ANDROID.RECORD_AUDIO];

export const READ_WRITE_MEDIA_PERMISSIONS = Platform.OS === "ios"
  ? [PERMISSIONS.IOS.PHOTO_LIBRARY]
  : androidReadWritePermissions;

export const WRITE_MEDIA_PERMISSIONS = Platform.OS === "ios"
  ? [PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY]
  : androidWritePermissions;

export const LOCATION_PERMISSIONS = Platform.OS === "ios"
  ? [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]
  : [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];

interface Props extends PropsWithChildren {
  blockedPrompt?: string;
  body?: string;
  body2?: string;
  buttonText?: string;
  icon: string;
  image?: number;
  onModalHide?: () => void;
  onPermissionBlocked?: () => void;
  onPermissionDenied?: () => void;
  onPermissionGranted?: () => void;
  permissionNeeded?: boolean;
  permissions: Permission[];
  testID?: string;
  title?: string;
  titleDenied?: string;
  withoutNavigation?: boolean;
}

interface MultiResult {
  [permission: string]: PermissionStatus;
}
export function permissionResultFromMultiple( multiResults: MultiResult ) {
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
  // Note: we're not checking for RESULTS.LIMITED here and treat it as GRANTED
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
  body2,
  buttonText,
  children,
  icon,
  image,
  /** Callback when modal is completely hidden (pass through to react-native-modal) */
  onModalHide: onModalHideProp,
  onPermissionBlocked,
  onPermissionDenied,
  onPermissionGranted,
  permissionNeeded = true,
  permissions,
  testID,
  title,
  titleDenied,
  withoutNavigation
}: Props ): JSX.Element | null => {
  const [result, setResult] = useState<PermissionStatus | null>( null );
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
      return () => undefined;
    }
    if ( !withoutNavigation ) {
      const unsubscribe = navigation.addListener( "focus", async () => {
        await checkPermission( );
        setModalShown( true );
      } );
      return unsubscribe;
    }
    return () => undefined;
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
  }, [
    setModalShown
  ] );

  const onModalHide = useCallback( ( ) => {
    if ( onModalHideProp ) {
      onModalHideProp( );
    }
    if ( !withoutNavigation ) navigation.goBack( );
  }, [
    navigation,
    onModalHideProp,
    withoutNavigation
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
      onModalHide={onModalHide}
      modal={(
        <PermissionGate
          requestPermission={requestPermission}
          grantStatus={result}
          icon={icon}
          title={title}
          titleDenied={titleDenied}
          body={body}
          body2={body2}
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
