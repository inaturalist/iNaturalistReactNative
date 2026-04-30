import ExploreStackNavigator
  from "navigation/StackNavigators/ExploreStackNavigator";
import {
  defaultExploreV2Location,
  EXPLORE_V2_ACTION,
  EXPLORE_V2_PLACE_MODE,
  ExploreV2Provider,
  useExploreV2,
} from "providers/ExploreV2Context";
import React, { useEffect, useRef } from "react";
import useLocationPermission from "sharedHooks/useLocationPermission";

const ExploreV2WithProvider = ( ) => {
  const { state, dispatch } = useExploreV2( );
  const {
    hasPermissions,
    renderPermissionsGate,
  } = useLocationPermission( );
  const previousHasPermissions = useRef<boolean | undefined>( undefined );

  // Resolve initial location once we know permission state. NEARBY with no
  // coords means we haven't fetched the user's coarse location yet.
  useEffect( ( ) => {
    let cancelled = false;
    async function resolveLocation( ) {
      if (
        hasPermissions
        && !previousHasPermissions.current
        && state.placeMode === EXPLORE_V2_PLACE_MODE.NEARBY
        && state.lat === undefined
      ) {
        const next = await defaultExploreV2Location( );
        if ( cancelled ) return;
        if (
          next.placeMode === EXPLORE_V2_PLACE_MODE.NEARBY
          && next.lat !== undefined
          && next.lng !== undefined
          && next.radius !== undefined
        ) {
          dispatch( {
            type: EXPLORE_V2_ACTION.SET_LOCATION_NEARBY,
            lat: next.lat,
            lng: next.lng,
            radius: next.radius,
          } );
        } else {
          dispatch( { type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE } );
        }
      }
      previousHasPermissions.current = hasPermissions;
    }
    resolveLocation( );
    return ( ) => {
      cancelled = true;
    };
  }, [hasPermissions, state.placeMode, state.lat, dispatch] );

  // Per the ticket: default to "Worldwide" when location is denied (or blocked).
  // Once permission state is known to be false, fall back from NEARBY.
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
