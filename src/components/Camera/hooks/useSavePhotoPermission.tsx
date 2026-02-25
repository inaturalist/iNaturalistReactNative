import {
  permissionResultFromMultiple,
  WRITE_MEDIA_PERMISSIONS,
} from "components/SharedComponents/PermissionGateContainer";
import React, { useCallback, useEffect, useState } from "react";
import {
  checkMultiple,
  RESULTS,
} from "react-native-permissions";

import SavePhotoPermissionGate from "../SavePhotoPermissionGate";

// PermissionGate callbacks need to use useCallback, otherwise they'll
// trigger re-renders if/when they change
interface SavePhotoPermissionCallbacks {
  onPermissionGranted?: ( ) => void;
  onPermissionDenied?: ( ) => void;
  onPermissionBlocked?: ( ) => void;
  onModalHide?: ( ) => void;
}

/**
 * A hook to check and request SavePhoto permissions.
 * @returns {boolean} hasPermissions - Undefined if permissions have not been checked yet.
 * True if permissions have been granted. False if permissions have been denied.
 * @returns {Function} renderPermissionsGate - A function to render the permissions gate.
 * @returns {Function} requestPermissions - A function to request SavePhoto permissions.
 * Essentially just a wrapper around toggling permissionNeeded for the SavePhotoPermissionGate.
 */
const useSavePhotoPermission = ( ) => {
  const [hasPermissions, setHasPermissions] = useState<boolean>( );
  const [showPermissionGate, setShowPermissionGate] = useState( false );
  const [hasBlockedPermissions, setHasBlockedPermissions] = useState( false );

  // PermissionGate callbacks need to use useCallback, otherwise they'll
  // trigger re-renders if/when they change
  const renderPermissionsGate = useCallback( ( callbacks?: SavePhotoPermissionCallbacks ) => {
    const {
      onPermissionGranted,
      onPermissionBlocked,
      onModalHide,
    } = callbacks || { };

    // this prevents infinite rerenders of the SavePhotoPermissionGate component
    if ( !showPermissionGate ) {
      return null;
    }

    return (
      <SavePhotoPermissionGate
        permissionNeeded
        withoutNavigation
        onModalHide={( ) => {
          setShowPermissionGate( false );
          if ( !hasPermissions && onModalHide ) onModalHide( );
        }}
        onPhotoPermissionGranted={( ) => {
          setShowPermissionGate( false );
          setHasPermissions( true );
          setHasBlockedPermissions( false );
          if ( onPermissionGranted ) onPermissionGranted( );
        }}
        onPhotoPermissionBlocked={( ) => {
          setHasPermissions( false );
          setHasBlockedPermissions( true );
          setShowPermissionGate( true );
          if ( onPermissionBlocked ) onPermissionBlocked( );
        }}
      />
    );
  }, [showPermissionGate, hasPermissions] );

  // This gets exported and used as a dependency, so it needs to have
  // referential stability
  const requestPermissions = useCallback(
    ( ) => setShowPermissionGate( true ),
    [],
  );

  const checkPermissions = useCallback( async () => {
    const permissionsResult = permissionResultFromMultiple(
      await checkMultiple( WRITE_MEDIA_PERMISSIONS ),
    );
    if ( permissionsResult === RESULTS.GRANTED ) {
      setHasPermissions( true );
    } else if ( permissionsResult === RESULTS.BLOCKED ) {
      setHasPermissions( false );
      setHasBlockedPermissions( true );
    } else {
      setHasPermissions( false );
    }
  }, [] );

  // Check permissions on mount
  useEffect( () => {
    checkPermissions();
  }, [checkPermissions] );

  return {
    hasPermissions,
    renderPermissionsGate,
    requestPermissions,
    hasBlockedPermissions,
    checkPermissions,
  };
};

export default useSavePhotoPermission;
