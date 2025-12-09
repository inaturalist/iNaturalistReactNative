import LocationPermissionGate from "components/SharedComponents/LocationPermissionGate";
import {
  LOCATION_PERMISSIONS,
  permissionResultFromMultiple
} from "components/SharedComponents/PermissionGateContainer";
import React, { useCallback, useEffect, useState } from "react";
import {
  checkMultiple,
  RESULTS
} from "react-native-permissions";

// PermissionGate callbacks need to use useCallback, otherwise they'll
// trigger re-renders if/when they change
export interface LocationPermissionCallbacks {
  onPermissionGranted?: ( ) => void;
  onPermissionDenied?: ( ) => void;
  onPermissionBlocked?: ( ) => void;
  onModalHide?: ( ) => void;
}

export type RenderLocationPermissionsGateFunction = (
  callbacks: LocationPermissionCallbacks | undefined
) => React.JSX.Element | null;

/**
 * A hook to check and request location permissions.
 * @returns {boolean} hasPermissions - Undefined if permissions have not been checked yet.
 * True if permissions have been granted. False if permissions have been denied.
 * @returns {Function} renderPermissionsGate - A function to render the permissions gate.
 * @returns {Function} requestPermissions - A function to request location permissions.
 * Essentially just a wrapper around toggling permissionNeeded for the LocationPermissionGate.
 */
const useLocationPermission = ( ) => {
  const [hasPermissions, setHasPermissions] = useState<boolean>( );
  const [showPermissionGate, setShowPermissionGate] = useState( false );
  const [hasBlockedPermissions, setHasBlockedPermissions] = useState( false );

  // PermissionGate callbacks need to use useCallback, otherwise they'll
  // trigger re-renders if/when they change
  const renderPermissionsGate: RenderLocationPermissionsGateFunction
    = useCallback(
      ( callbacks?: LocationPermissionCallbacks ) => {
        const {
          onPermissionGranted,
          onPermissionDenied,
          onPermissionBlocked,
          onModalHide
        } = callbacks || {};

        // this prevents infinite rerenders of the LocationPermissionGate component
        if ( !showPermissionGate ) {
          return null;
        }

        return (
          <LocationPermissionGate
            permissionNeeded
            withoutNavigation
            onModalHide={() => {
              setShowPermissionGate( false );
              if ( onModalHide ) onModalHide();
            }}
            onPermissionGranted={() => {
              setShowPermissionGate( false );
              setHasPermissions( true );
              setHasBlockedPermissions( false );
              if ( onPermissionGranted ) onPermissionGranted();
            }}
            onPermissionDenied={() => {
              if ( onPermissionDenied ) onPermissionDenied();
            }}
            onPermissionBlocked={() => {
              setHasPermissions( false );
              setHasBlockedPermissions( true );
              setShowPermissionGate( true );
              if ( onPermissionBlocked ) onPermissionBlocked();
            }}
          />
        );
      },
      [showPermissionGate]
    );

  // This gets exported and used as a dependency, so it needs to have
  // referential stability
  const requestPermissions = useCallback(
    ( ) => setShowPermissionGate( true ),
    []
  );

  const checkPermissions = useCallback( async () => {
    const permissionsResult = permissionResultFromMultiple(
      await checkMultiple( LOCATION_PERMISSIONS )
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
    checkPermissions
  };
};

export default useLocationPermission;
