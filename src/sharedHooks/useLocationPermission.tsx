import LocationPermissionGate from "components/SharedComponents/LocationPermissionGate.tsx";
import {
  LOCATION_PERMISSIONS,
  permissionResultFromMultiple
} from "components/SharedComponents/PermissionGateContainer.tsx";
import React, { useEffect, useState } from "react";
import {
  checkMultiple,
  RESULTS
} from "react-native-permissions";

/**
   * A hook to check and request location permissions.
   * @returns {boolean} hasPermissions - Undefined if permissions have not been checked yet.
   * True if permissions have been granted. False if permissions have been denied.
   * @returns {Function} renderPermissionsGate - A function to render the permissions gate.
   * @returns {Function} requestPermission - A function to request location permissions.
   * Essentially just a wrapper around toggling permissionNeeded for the LocationPermissionGate.
   */
const useLocationPermission = () => {
  const [hasPermissions, setHasPermissions] = useState<boolean>( );
  const [showPermissionGate, setShowPermissionGate] = useState( false );

  const renderPermissionsGate = () => (
    <LocationPermissionGate
      permissionNeeded={showPermissionGate}
      withoutNavigation
      onModalHide={( ) => setShowPermissionGate( false )}
      onPermissionGranted={( ) => {
        setShowPermissionGate( false );
        setHasPermissions( true );
      }}
      onPermissionDenied={( ) => {
        setShowPermissionGate( false );
        setHasPermissions( false );
      }}
      onPermissionBlocked={( ) => {
        setShowPermissionGate( false );
        setHasPermissions( false );
      }}
    />
  );

  function requestPermission() {
    setShowPermissionGate( true );
  }

  async function checkPermissions() {
    const permissionsResult = permissionResultFromMultiple(
      await checkMultiple( LOCATION_PERMISSIONS )
    );
    if ( permissionsResult === RESULTS.GRANTED ) {
      setHasPermissions( true );
    } else {
      setHasPermissions( false );
      console.log( "Location permissions have not been granted." );
    }
  }

  useEffect( () => {
    checkPermissions();
  }, [] );

  return { hasPermissions, renderPermissionsGate, requestPermission };
};

export default useLocationPermission;
