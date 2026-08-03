import type { ApiTotalBounds } from "api/types";
import type {
  ExploreV2QueryParams,
  NearbyCoords,
} from "components/Explore/ExploreV2/helpers/buildQueryParams";
import ActivityIndicator from "components/SharedComponents/ActivityIndicator";
import Button from "components/SharedComponents/Buttons/Button";
import { getMapRegion } from "components/SharedComponents/Map/helpers/mapHelpers";
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

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
  elevation: 6,
} );

const regionFromBounds = ( bounds: ApiTotalBounds ): Region => {
  const latitudeDelta = Math.abs( bounds.nelat - bounds.swlat );
  const longitudeDelta = Math.abs( bounds.nelng - bounds.swlng );
  return {
    latitude: bounds.nelat - ( latitudeDelta / 2 ),
    longitude: bounds.nelng - ( longitudeDelta / 2 ),
    latitudeDelta,
    longitudeDelta,
  };
};

interface Props {
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
  const [showRedoSearch, setShowRedoSearch] = useState( false );
  const {
    swlat, swlng, nelat, nelng,
  } = totalBounds || {};

  // The region the camera should be showing for the current context
  const targetRegion = useMemo( ( ): Region | undefined => {
    if ( placeMode === EXPLORE_V2_PLACE_MODE.NEARBY ) {
      return nearbyCoords
        ? {
          latitude: nearbyCoords.lat,
          longitude: nearbyCoords.lng,
          latitudeDelta: NEARBY_DELTA,
          longitudeDelta: NEARBY_DELTA,
        }
        : undefined;
    }
    // the corners being undefined here represents a loading state
    const hasBounds = placeMode !== EXPLORE_V2_PLACE_MODE.MAP_AREA
      && swlat !== undefined
      && swlng !== undefined
      && nelat !== undefined
      && nelng !== undefined;
    return hasBounds
      ? getMapRegion( {
        swlat, swlng, nelat, nelng,
      } )
      : undefined;
  }, [placeMode, nearbyCoords, swlat, swlng, nelat, nelng] );

  // in exploreV2, we unmount the map when switching between views
  // where ExploreV1 moves it off the screen, still mounted
  // mapAreaRegion specifies the initial map area for the remount after switching views
  const mapAreaRegion = useMemo( ( ): Region | undefined => (
    placeMode === EXPLORE_V2_PLACE_MODE.MAP_AREA && mapAreaBounds
      ? regionFromBounds( mapAreaBounds )
      : undefined
  ), [placeMode, mapAreaBounds] );

  // moves the map after mount, we *don't* want this for MAP_AREA bc
  // the bounds there are always set imperatively by the user moving the map themself
  const regionToAnimate = placeMode === EXPLORE_V2_PLACE_MODE.MAP_AREA
    ? undefined
    : targetRegion;

  const initialRegion = mapAreaRegion || targetRegion || WORLDWIDE_REGION;

  const handleRedoSearchPress = useCallback( async ( ) => {
    setShowRedoSearch( false );
    const bounds = await mapRef.current?.getMapBoundaries( );
    if ( !bounds ) return;
    onRedoSearchPress?.( {
      swlat: bounds.southWest.latitude,
      swlng: bounds.southWest.longitude,
      nelat: bounds.northEast.latitude,
      nelng: bounds.northEast.longitude,
    } );
  }, [onRedoSearchPress] );

  return (
    <View className="flex-1 overflow-hidden h-full">
      <Map
        ref={mapRef}
        initialRegion={initialRegion}
        isLoading={isLoading}
        onCurrentLocationPress={onCurrentLocationPress}
        onPanDrag={( ) => setShowRedoSearch( true )}
        regionToAnimate={regionToAnimate}
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
