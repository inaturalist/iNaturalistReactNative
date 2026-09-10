import type { ApiTotalBounds } from "api/types";
import type {
  ExploreV2QueryParams,
  NearbyCoords,
} from "components/Explore/ExploreV2/helpers/buildQueryParams";
import ActivityIndicator from "components/SharedComponents/ActivityIndicator";
import Button from "components/SharedComponents/Buttons/Button";
import {
  getMapRegion,
  regionFromBounds,
} from "components/SharedComponents/Map/helpers/mapHelpers";
import Map from "components/SharedComponents/Map/Map";
import { View } from "components/styledComponents";
import { EXPLORE_V2_PLACE_MODE } from "providers/ExploreV2Context";
import React, {
  useCallback, useMemo, useRef, useState,
} from "react";
import type MapView from "react-native-maps";
import type { Region } from "react-native-maps";
import { useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";

// matching v1 explore
const NEARBY_DELTA = 0.02;

const WORLDWIDE_REGION: Region = {
  latitude: 0,
  longitude: 0,
  latitudeDelta: 180,
  longitudeDelta: 180,
};

const activityIndicatorSize = 50;

// A worldwide search frames the map on the results so a regional taxon isn't off screen,
// but for a global result set the API's total_bounds are not something to frame on: they
// either cover the globe or collapse to a sliver along one axis (an antimeridian artifact).
const isGlobalBounds = ( {
  swlat, swlng, nelat, nelng,
}: ApiTotalBounds ) => {
  const latSpan = Math.abs( nelat - swlat );
  const lngSpan = Math.abs( nelng - swlng );
  const coversGlobe = latSpan >= 120 || lngSpan >= 300;
  const collapsedOnOneAxis = Math.min( latSpan, lngSpan ) < 0.001
    && Math.max( latSpan, lngSpan ) > 1;
  return coversGlobe || collapsedOnOneAxis;
};

const regionForResults = ( bounds: ApiTotalBounds, placeMode: EXPLORE_V2_PLACE_MODE ) => (
  placeMode === EXPLORE_V2_PLACE_MODE.WORLDWIDE && isGlobalBounds( bounds )
    ? WORLDWIDE_REGION
    : getMapRegion( bounds )
);

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
  elevation: 6,
} );

interface Props {
  appliedSearchCount: number;
  isLoading: boolean;
  mapAreaBounds?: ApiTotalBounds;
  nearbyCoords?: NearbyCoords;
  onCurrentLocationPress?: ( ) => void;
  onRedoSearchPress?: ( _bounds: ApiTotalBounds ) => void;
  placeMode: EXPLORE_V2_PLACE_MODE;
  queryParams: ExploreV2QueryParams;
  totalBounds?: ApiTotalBounds;
}

const ExploreV2MapView = ( {
  appliedSearchCount,
  isLoading,
  mapAreaBounds,
  nearbyCoords,
  onCurrentLocationPress,
  onRedoSearchPress,
  placeMode,
  queryParams,
  totalBounds,
}: Props ) => {
  const { t } = useTranslation( );
  const mapRef = useRef<MapView | null>( null );
  // The search the user panned away from. The "Redo search in this area"
  // button shows only while that is still the current search, so a new search
  // moving the map out from under the user hides it without a reset.
  const [pannedFrom, setPannedFrom] = useState<{
    placeMode: EXPLORE_V2_PLACE_MODE;
    targetRegion?: Region;
  } | null>( null );
  const {
    swlat, swlng, nelat, nelng,
  } = totalBounds || {};

  const nearbyRegion = useMemo( ( ): Region | undefined => (
    nearbyCoords
      ? {
        latitude: nearbyCoords.lat,
        longitude: nearbyCoords.lng,
        latitudeDelta: NEARBY_DELTA,
        longitudeDelta: NEARBY_DELTA,
      }
      : undefined
  ), [nearbyCoords] );

  // the corners being undefined here represents a loading state
  const boundsRegion = useMemo( ( ): Region | undefined => {
    const hasBounds = swlat !== undefined
      && swlng !== undefined
      && nelat !== undefined
      && nelng !== undefined;
    return hasBounds
      ? regionForResults( {
        swlat, swlng, nelat, nelng,
      }, placeMode )
      : undefined;
  }, [swlat, swlng, nelat, nelng, placeMode] );

  // in exploreV2, we unmount the map when switching between views
  // where ExploreV1 moves it off the screen, still mounted
  // mapAreaRegion specifies the initial map area for the remount after switching views
  const mapAreaRegion = useMemo( ( ): Region | undefined => (
    placeMode === EXPLORE_V2_PLACE_MODE.MAP_AREA && mapAreaBounds
      ? regionFromBounds( mapAreaBounds )
      : undefined
  ), [placeMode, mapAreaBounds] );

  // Map area bounds come from two places: this map reporting where the user panned
  // (the map is already there, so the camera must not chase them), and a saved search
  // handing us an area chosen somewhere else (the camera has to move). The search's
  // appliedSearchCount tells them apart: remember which applied search our last redo
  // belonged to, and any map area arriving under a newer count came from outside.
  const [redoAppliedSearchCount, setRedoAppliedSearchCount] = useState( appliedSearchCount );

  // The region the camera should be showing for the current context
  const cameraRegion = useMemo( ( ): Region | undefined => {
    if ( placeMode === EXPLORE_V2_PLACE_MODE.NEARBY ) return nearbyRegion;
    if ( placeMode === EXPLORE_V2_PLACE_MODE.MAP_AREA ) {
      return appliedSearchCount === redoAppliedSearchCount
        ? undefined
        : mapAreaRegion;
    }
    return boundsRegion;
  }, [
    placeMode,
    nearbyRegion,
    boundsRegion,
    mapAreaRegion,
    appliedSearchCount,
    redoAppliedSearchCount,
  ] );

  // Re-applying a saved search can land on the exact coordinates the user panned away from.
  // The map moves its camera when this object changes, so stamp it with the applied search
  // it belongs to: identical coordinates under a new count are still a new request.
  const targetRegion = useMemo(
    ( ) => cameraRegion && { ...cameraRegion, appliedSearchCount },
    [cameraRegion, appliedSearchCount],
  );

  const initialRegion = mapAreaRegion || cameraRegion || WORLDWIDE_REGION;

  const showRedoSearch = pannedFrom !== null
    && pannedFrom.placeMode === placeMode
    && pannedFrom.targetRegion === targetRegion;

  const handlePanDrag = useCallback( ( ) => {
    setPannedFrom( previous => (
      previous?.placeMode === placeMode && previous?.targetRegion === targetRegion
        ? previous
        : { placeMode, targetRegion }
    ) );
  }, [placeMode, targetRegion] );

  const handleRedoSearchPress = useCallback( async ( ) => {
    setPannedFrom( null );
    const bounds = await mapRef.current?.getMapBoundaries( );
    if ( !bounds ) return;
    setRedoAppliedSearchCount( appliedSearchCount );
    onRedoSearchPress?.( {
      swlat: bounds.southWest.latitude,
      swlng: bounds.southWest.longitude,
      nelat: bounds.northEast.latitude,
      nelng: bounds.northEast.longitude,
    } );
  }, [appliedSearchCount, onRedoSearchPress] );

  return (
    <View className="flex-1 overflow-hidden h-full">
      <Map
        ref={mapRef}
        initialRegion={initialRegion}
        isLoading={isLoading}
        onCurrentLocationPress={onCurrentLocationPress}
        onPanDrag={handlePanDrag}
        regionToAnimate={targetRegion}
        showCurrentLocationButton
        showsCompass={false}
        showSwitchMapTypeButton
        showsUserLocation
        switchMapTypeButtonClassName="right-5 bottom-20"
        tileMapParams={queryParams}
        withPressableObsTiles
      />
      {showRedoSearch && (
        <View
          className="absolute top-5 left-0 right-0 items-center z-10"
          style={DROP_SHADOW}
          testID="ExploreV2MapView.redoSearch"
        >
          <Button
            text={t( "REDO-SEARCH-IN-MAP-AREA" )}
            level="focus"
            onPress={handleRedoSearchPress}
          />
        </View>
      )}
      {isLoading && (
        <View
          className="absolute top-0 bottom-0 left-0 right-0 items-center justify-center"
          testID="ExploreV2MapView.loading"
        >
          <ActivityIndicator size={activityIndicatorSize} />
        </View>
      )}
    </View>
  );
};

export default ExploreV2MapView;
