import find from "lodash/find";
import { Platform } from "react-native";
import type {
  AndroidPermission,
  PermissionStatus,
} from "react-native-permissions";
import {
  checkMultiple,
  PERMISSIONS,
  requestMultiple,
  RESULTS,
} from "react-native-permissions";

const usesAndroid10Permissions = Platform.OS === "android" && Platform.Version <= 29;
const usesAndroid13Permissions = Platform.OS === "android" && Platform.Version >= 33;

let androidReadWritePermissions: AndroidPermission[] = [
  PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION,
];
if ( usesAndroid10Permissions ) {
  androidReadWritePermissions = [
    ...androidReadWritePermissions,
    PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
  ];
} else if ( usesAndroid13Permissions ) {
  androidReadWritePermissions = [
    ...androidReadWritePermissions,
    PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
  ];
} else {
  androidReadWritePermissions = [
    ...androidReadWritePermissions,
    PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  ];
}

const androidWritePermissions: AndroidPermission[] = usesAndroid10Permissions
  ? [PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE]
  : [];

export const CAMERA_PERMISSIONS = Platform.OS === "ios"
  ? [PERMISSIONS.IOS.CAMERA]
  : [PERMISSIONS.ANDROID.CAMERA];

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
  : [
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
  ];

export interface MultiResult {
  [permission: string]: PermissionStatus;
}

export function permissionResultFromMultiple( multiResults: MultiResult ) {
  if ( typeof ( multiResults ) !== "object" ) {
    throw new Error(
      "permissionResultFromMultiple received something other than an object. "
      + "Make sure you're using it with checkMultiple and not check",
    );
  }
  // On Android 12+, the user may grant only approximate (coarse) location,
  // leaving fine location denied. If ANY location permission is granted,
  // the overall result is GRANTED.
  const coarseKey = PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION;
  if ( coarseKey in multiResults ) {
    if ( find( multiResults, permResult => permResult === RESULTS.GRANTED ) ) {
      return RESULTS.GRANTED;
    }
    if ( find( multiResults, permResult => permResult === RESULTS.LIMITED ) ) {
      return RESULTS.LIMITED;
    }
    if ( find( multiResults, permResult => permResult === RESULTS.BLOCKED ) ) {
      return RESULTS.BLOCKED;
    }
    if ( find( multiResults, permResult => permResult === RESULTS.DENIED ) ) {
      return RESULTS.DENIED;
    }
    return RESULTS.UNAVAILABLE;
  }
  // All non-android location permissions use this path
  if ( find( multiResults, ( permResult, _perm ) => permResult === RESULTS.BLOCKED ) ) {
    return RESULTS.BLOCKED;
  }
  if ( find( multiResults, ( permResult, _perm ) => permResult === RESULTS.DENIED ) ) {
    return RESULTS.DENIED;
  }
  if ( find( multiResults, ( permResult, _perm ) => permResult === RESULTS.UNAVAILABLE ) ) {
    return RESULTS.UNAVAILABLE;
  }
  if ( find( multiResults, ( permResult, _perm ) => permResult === RESULTS.LIMITED ) ) {
    return RESULTS.LIMITED;
  }
  return RESULTS.GRANTED;
}

export async function hasOnlyCoarseLocation(): Promise<boolean> {
  if ( Platform.OS !== "android" ) return false;
  const results = await checkMultiple( LOCATION_PERMISSIONS );
  return (
    results[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === RESULTS.GRANTED
    && results[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] !== RESULTS.GRANTED
  );
}

export async function hasWriteMediaPermission( ) {
  // WRITE_MEDIA_PERMISSIONS is empty on android 11+ because we don't need to request permissions
  if ( WRITE_MEDIA_PERMISSIONS.length === 0 ) return true;
  const result = permissionResultFromMultiple(
    await checkMultiple( WRITE_MEDIA_PERMISSIONS ),
  );
  return result === RESULTS.GRANTED;
}

export async function requestWriteMediaPermission( ) {
  if ( WRITE_MEDIA_PERMISSIONS.length === 0 ) return true;
  const result = permissionResultFromMultiple(
    await requestMultiple( WRITE_MEDIA_PERMISSIONS ),
  );
  return result === RESULTS.GRANTED;
}

export async function requestReadWriteMediaPermissions( ) {
  if ( Platform.OS !== "android" ) return true;
  const result = permissionResultFromMultiple(
    await requestMultiple( READ_WRITE_MEDIA_PERMISSIONS ),
  );
  return result === RESULTS.GRANTED;
}
