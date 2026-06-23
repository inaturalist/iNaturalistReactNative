import ExploreStackNavigator
  from "navigation/StackNavigators/ExploreStackNavigator";
import {
  defaultExploreV2Location,
  EXPLORE_V2_ACTION,
  EXPLORE_V2_PLACE_MODE,
  ExploreV2Provider,
  useExploreV2,
} from "providers/ExploreV2Context";
import React, { useEffect, useEffectEvent } from "react";
import useLocationPermission from "sharedHooks/useLocationPermission";

interface ExploreV2WithProviderProps {
  hasPermissions?: boolean;
  hasBlockedPermissions: boolean;
}

const ExploreV2WithProvider = ( {
  hasPermissions,
  hasBlockedPermissions,
}: ExploreV2WithProviderProps ) => {
  const { state, dispatch } = useExploreV2( );
  // useEffectEvent is a new pattern for us, which we are adding only to new code for the moment
  // https://github.com/inaturalist/iNaturalistReactNative/pull/3585#discussion_r3220223241
  const onPermissionsResolved = useEffectEvent( async ( ) => {
    const { placeMode } = state.location;

    if ( hasPermissions ) {
      if (
        placeMode !== EXPLORE_V2_PLACE_MODE.UNINITIALIZED
        && placeMode !== EXPLORE_V2_PLACE_MODE.NEEDS_PERMISSION
      ) return;
      // if we have location permissions
      // and place mode isn't one of the viewable modes (worldwide, nearby, specfic place)
      // then attempt to get and set the user's location
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
    } else if ( hasBlockedPermissions ) {
      if (
        placeMode === EXPLORE_V2_PLACE_MODE.UNINITIALIZED
        || placeMode === EXPLORE_V2_PLACE_MODE.NEEDS_PERMISSION
      ) {
        // user has explicitly denied location permissions, set place mode to worldwide
        dispatch( { type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE } );
      }
    } else if ( placeMode === EXPLORE_V2_PLACE_MODE.UNINITIALIZED ) {
      dispatch( { type: EXPLORE_V2_ACTION.SET_LOCATION_NEEDS_PERMISSION } );
    }
  } );

  useEffect( ( ) => {
    if ( hasPermissions !== undefined ) {
      onPermissionsResolved( );
    }
  }, [hasPermissions, hasBlockedPermissions] );

  return (
    <ExploreStackNavigator />
  );
};

const ExploreV2Container = ( ) => {
  const {
    hasPermissions,
    hasBlockedPermissions,
    renderPermissionsGate,
    requestPermissions,
  } = useLocationPermission( );

  return (
    <ExploreV2Provider requestLocationPermissions={requestPermissions}>
      <ExploreV2WithProvider
        hasPermissions={hasPermissions}
        hasBlockedPermissions={hasBlockedPermissions}
      />
      {renderPermissionsGate( undefined )}
    </ExploreV2Provider>
  );
};

export default ExploreV2Container;
