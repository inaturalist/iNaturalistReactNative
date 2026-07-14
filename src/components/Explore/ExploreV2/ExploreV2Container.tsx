import { useQueryClient } from "@tanstack/react-query";
import { EXPLORE_V2_RESOLVED_NEARBY_QUERY_KEY }
  from "components/Explore/ExploreV2/hooks/useResolvedNearbyLocation";
import ExploreStackNavigator
  from "navigation/StackNavigators/ExploreStackNavigator";
import { ExploreV2Provider } from "providers/ExploreV2Context";
import React, { useCallback } from "react";
import useLocationPermission from "sharedHooks/useLocationPermission";

const ExploreV2Container = ( ) => {
  const {
    renderPermissionsGate,
    requestPermissions,
  } = useLocationPermission( );
  const queryClient = useQueryClient( );

  // Location is resolved lazily on the results screen. When the user grants
  // permission from that screen's prompt, drop the cached (NEEDS_PERMISSION)
  // resolution so nearby re-resolves with real coordinates.
  const onPermissionGranted = useCallback( ( ) => {
    queryClient.invalidateQueries( {
      queryKey: EXPLORE_V2_RESOLVED_NEARBY_QUERY_KEY,
    } );
  }, [queryClient] );

  return (
    <ExploreV2Provider requestLocationPermissions={requestPermissions}>
      <ExploreStackNavigator />
      {renderPermissionsGate( { onPermissionGranted } )}
    </ExploreV2Provider>
  );
};

export default ExploreV2Container;
