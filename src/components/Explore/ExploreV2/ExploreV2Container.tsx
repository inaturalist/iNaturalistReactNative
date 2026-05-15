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

const ExploreV2WithProvider = ( ) => {
  const { state, dispatch } = useExploreV2( );
  const {
    hasPermissions,
  } = useLocationPermission( );
  // useEffectEvent is a new pattern for us, which we are adding only to new code for the moment
  // https://github.com/inaturalist/iNaturalistReactNative/pull/3585#discussion_r3220223241
  const onPermissionsGained = useEffectEvent( async ( ) => {
    if ( state.location.placeMode !== EXPLORE_V2_PLACE_MODE.UNINITIALIZED ) return;

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

  // default to "Worldwide" when location is denied
  // hasPermissions === false always means permission has been denied or blocked
  const onPermissionsDenied = useEffectEvent( ( ) => {
    if ( state.location.placeMode === EXPLORE_V2_PLACE_MODE.UNINITIALIZED ) {
      dispatch( { type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE } );
    }
  } );

  // handle location permission changes on Explore
  useEffect( ( ) => {
    if ( hasPermissions === true ) {
      onPermissionsGained( );
    } else if ( hasPermissions === false ) {
      onPermissionsDenied( );
    }
  }, [hasPermissions] );

  return (
    <ExploreStackNavigator />
  );
};

const ExploreV2Container = ( ) => (
  <ExploreV2Provider>
    <ExploreV2WithProvider />
  </ExploreV2Provider>
);

export default ExploreV2Container;
