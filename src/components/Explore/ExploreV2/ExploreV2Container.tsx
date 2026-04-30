import ExploreStackNavigator
  from "navigation/StackNavigators/ExploreStackNavigator";
import {
  defaultExploreV2Location,
  EXPLORE_V2_ACTION,
  EXPLORE_V2_PLACE_MODE,
  ExploreV2Provider,
  useExploreV2,
} from "providers/ExploreV2Context";
import React, { useEffect, useEffectEvent, useRef } from "react";
import useLocationPermission from "sharedHooks/useLocationPermission";

const ExploreV2WithProvider = ( ) => {
  const { state, dispatch } = useExploreV2( );
  const {
    hasPermissions,
    renderPermissionsGate,
  } = useLocationPermission( );
  const previousHasPermissions = useRef<boolean | undefined>( undefined );

  const onPermissionsGained = useEffectEvent( async ( ) => {
    // State not empty. Do nothing
    if (
      state.placeMode !== EXPLORE_V2_PLACE_MODE.NEARBY
      || state.lat !== undefined
    ) return;

    const next = await defaultExploreV2Location( );
    if ( next.placeMode === EXPLORE_V2_PLACE_MODE.NEARBY ) {
      dispatch( {
        type: EXPLORE_V2_ACTION.SET_LOCATION_NEARBY,
        lat: next.lat,
        lng: next.lng,
        radius: next.radius,
      } );
    } else {
      dispatch( { type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE } );
    }
  } );

  // handle granting location permissions on Explore
  useEffect( ( ) => {
    if ( hasPermissions && !previousHasPermissions.current ) {
      onPermissionsGained( );
    }
    previousHasPermissions.current = hasPermissions;
  }, [hasPermissions] );

  // default to "Worldwide" when location is denied
  // hasPermissions === false always means permission has been denied or blocked
  useEffect( ( ) => {
    if (
      hasPermissions === false
      && state.placeMode === EXPLORE_V2_PLACE_MODE.NEARBY
    ) {
      dispatch( { type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE } );
    }
  }, [hasPermissions, state.placeMode, dispatch] );

  return (
    <>
      <ExploreStackNavigator />
      {renderPermissionsGate( undefined )}
    </>
  );
};

const ExploreV2Container = ( ) => (
  <ExploreV2Provider>
    <ExploreV2WithProvider />
  </ExploreV2Provider>
);

export default ExploreV2Container;
