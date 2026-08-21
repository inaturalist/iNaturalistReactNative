import { ActivityIndicator, Map } from "components/SharedComponents";
import { getMapRegion } from "components/SharedComponents/Map/helpers/mapHelpers";
import { View } from "components/styledComponents";
import { useMyObservations } from "providers/MyObservationsContext";
import React, { useCallback, useMemo, useState } from "react";
import type { Region } from "react-native-maps";
import type { MyObservationsSlice } from "stores/createMyObservationsSlice";
import useStore from "stores/useStore";

import Announcements from "./Announcements";
import useMyObservationsMapBounds from "./hooks/useMyObservationsMapBounds";

interface Props {
  isConnected: boolean;
  userId?: number;
}

// default shown before the user's observation bounds have loaded, just a placeholder
// until `regionToAnimate` below moves the camera to fit the user's observations.
const WORLDWIDE_REGION: Region = {
  latitude: 0,
  longitude: 0,
  latitudeDelta: 180,
  longitudeDelta: 180,
};

const activityIndicatorSize = 50;

const MyObservationsMapView = ( { isConnected, userId }: Props ) => {
  const { state: myObsState } = useMyObservations( );
  const searchedTaxonId = myObsState.searchedTaxon?.id;
  const searchActive = !!myObsState.searchedTaxon;
  const { totalBounds, isLoading } = useMyObservationsMapBounds( userId, searchedTaxonId, true );

  const setMyObservationsMapRegion: MyObservationsSlice["setMyObservationsMapRegion"] = useStore(
    ( state: MyObservationsSlice ) => state.setMyObservationsMapRegion,
  );

  // Snapshot on mount for initialRegion. Subscribing to the region itself would
  // re-render the map on every pan, since this component writes it on every pan.
  const [restoredRegion] = useState<Region | null>(
    ( ) => useStore.getState( ).myObservationsMapRegion,
  );

  // Selecting a boolean rather than the region: this only re-renders when a
  // stored region appears or disappears, not as it changes. The slice clears
  // the region whenever the searched taxon changes, so if there's a stored region,
  // it means user moved the camera within the search they're looking at now, and we
  // should put them back instead of re-fitting to bounds.
  const hasStoredRegion = useStore(
    ( state: MyObservationsSlice ) => state.myObservationsMapRegion !== null,
  );
  const restoringCamera = hasStoredRegion && restoredRegion !== null;

  const regionToAnimate = useMemo(
    ( ) => ( restoringCamera || !totalBounds
      ? undefined
      : getMapRegion( totalBounds ) ),
    [restoringCamera, totalBounds],
  );

  const handleRegionChangeComplete = useCallback( ( region: Region ) => {
    // Ignore camera moves before the user's bounds have loaded, otherwise we
    // save the worldwide placeholder and restore that next time.
    if ( !isLoading ) {
      setMyObservationsMapRegion( region );
    }
  }, [isLoading, setMyObservationsMapRegion] );

  return (
    <View className="flex-1 overflow-hidden h-full">
      {!searchActive && <Announcements isConnected={isConnected} />}
      <View className="flex-1 overflow-hidden">
        <Map
          initialRegion={restoredRegion ?? WORLDWIDE_REGION}
          isLoading={isLoading}
          onRegionChangeComplete={handleRegionChangeComplete}
          regionToAnimate={regionToAnimate}
          showCurrentLocationButton
          showSwitchMapTypeButton
          showsUserLocation
          switchMapTypeButtonClassName="right-5 bottom-20"
          tileMapParams={{
            user_id: userId,
            ...( searchedTaxonId && { taxon_id: searchedTaxonId } ),
          }}
          withPressableObsTiles
        />
        {isLoading && (
          <View
            className="absolute inset-0 items-center justify-center"
            testID="MyObservationsMapView.loading"
          >
            <ActivityIndicator size={activityIndicatorSize} />
          </View>
        )}
      </View>
    </View>
  );
};

export default MyObservationsMapView;
