import {
  ActivityIndicator,
  Button,
  Map
} from "components/SharedComponents";
import { getMapRegion } from "components/SharedComponents/Map/helpers/mapHelpers.ts";
import { View } from "components/styledComponents";
import {
  EXPLORE_ACTION, MapBoundaries, PLACE_MODE, useExplore
} from "providers/ExploreContext.tsx";
import React, {
  useEffect, useMemo, useRef, useState
} from "react";
// import useMapLocation from "./hooks/useMapLocation";
import { useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";

const NEARBY_DELTA = 0.02;

const WORLDWIDE_DELTA = 180;
const WORLDWIDE_LAT_LNG = 0.0;

const worldwideRegion = {
  latitude: WORLDWIDE_LAT_LNG,
  longitude: WORLDWIDE_LAT_LNG,
  latitudeDelta: WORLDWIDE_DELTA,
  longitudeDelta: WORLDWIDE_DELTA
};

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
  elevation: 6
} );

const centeredLoadingWheel = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.3)",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 20
};

interface Props {
  // Bounding box of the observations retrieved for the query params
  observationBounds?: MapBoundaries,
  queryParams: {
    taxon_id?: number;
    return_bounds?: boolean;
    order?: string;
    orderBy?: string;
  };
  // currentMapRegion: Region;
  // setCurrentMapRegion: ( Region ) => void;
  isLoading: boolean
}

const MapView = ( {
  observationBounds,
  queryParams,
  // currentMapRegion,
  isLoading
  // setCurrentMapRegion
}: Props ) => {
  const { t } = useTranslation( );
  const { state: exploreState, dispatch } = useExplore( );
  const [showRedoSearchButton, setShowRedoSearchButton] = useState( false );
  const [currentMapBoundaries, setCurrentMapBoundaries] = useState<MapBoundaries>();
  const isFirstRender = useRef( true );

  const mapRef = useRef( null );

  const nearbyRegion = useMemo( () => ( {
    latitude: exploreState.lat,
    longitude: exploreState.lng,
    latitudeDelta: NEARBY_DELTA,
    longitudeDelta: NEARBY_DELTA
  } ), [exploreState.lat, exploreState.lng] );

  const regionFromCoordinates = useMemo( ( ) => {
    if ( exploreState.place?.point_geojson?.coordinates ) {
      const [longitude, latitude] = exploreState.place.point_geojson.coordinates;
      return {
        latitude,
        longitude,
        latitudeDelta: NEARBY_DELTA,
        longitudeDelta: NEARBY_DELTA
      };
    }
    return null;
  }, [exploreState.place] );

  useEffect( ( ) => {
    // Skip animation on first render
    if ( isFirstRender.current ) {
      isFirstRender.current = false;
      return;
    }

    if (
      observationBounds
      && [
        PLACE_MODE.WORLDWIDE,
        PLACE_MODE.PLACE,
        PLACE_MODE.NEARBY
      ].indexOf( exploreState.placeMode ) >= 0
    ) {
      const newRegion = getMapRegion( observationBounds );
      console.log( newRegion, "new region in observationBounds useEffect" );

      mapRef.current.animateToRegion( newRegion );

      setCurrentMapBoundaries( {
        swlat: observationBounds.swlat,
        swlng: observationBounds.swlng,
        nelat: observationBounds.nelat,
        nelng: observationBounds.nelng
      } );
      return;
    }

    if ( exploreState.place?.point_geojson?.coordinates && mapRef.current ) {
      mapRef.current.animateToRegion( regionFromCoordinates );
      return;
    }
    // since we're using initialRegion, we need to animate to the correct zoom level
    // when a user switches back to NEARBY or WORLDWIDE
    if ( mapRef.current
        && exploreState.placeMode === PLACE_MODE.NEARBY ) {
      mapRef.current.animateToRegion( nearbyRegion );
      return;
    }
    if ( mapRef.current
      && exploreState.placeMode === PLACE_MODE.WORLDWIDE ) {
      mapRef.current.animateToRegion( worldwideRegion );
    }
  }, [exploreState, nearbyRegion, regionFromCoordinates, observationBounds] );

  const handleRegionChangeComplete = ( region, boundaries ) => {
    if ( !boundaries ) { return; }
    setCurrentMapBoundaries( {
      swlat: boundaries.southWest.latitude,
      swlng: boundaries.southWest.longitude,
      nelat: boundaries.northEast.latitude,
      nelng: boundaries.northEast.longitude
    } );
  };

  const handleRedoSearch = ( ) => {
    setShowRedoSearchButton( false );
    dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_MAP_AREA } );
    dispatch( { type: EXPLORE_ACTION.SET_MAP_BOUNDARIES, mapBoundaries: currentMapBoundaries } );
  };

  const tileMapParams = {
    ...queryParams
  };
  // Tile queries never need these params
  delete tileMapParams.return_bounds;
  delete tileMapParams.order;
  delete tileMapParams.orderBy;

  const initialRegion = useMemo( () => {
    if ( exploreState.placeMode === PLACE_MODE.NEARBY ) {
      return nearbyRegion;
    }

    if ( exploreState.placeMode === PLACE_MODE.PLACE ) {
      return regionFromCoordinates;
    }

    return worldwideRegion;
  }, [exploreState.placeMode, nearbyRegion, regionFromCoordinates] );

  const handlePanDrag = ( ) => setShowRedoSearchButton( true );

  return (
    <View className="flex-1 overflow-hidden h-full">
      <View className="z-10">
        {showRedoSearchButton && (
          <View
            className="mx-auto"
            style={DROP_SHADOW}
          >
            <Button
              text={t( "REDO-SEARCH-IN-MAP-AREA" )}
              level="focus"
              className="top-[60px] absolute self-center"
              onPress={handleRedoSearch}
            />
          </View>
        )}
      </View>
      <Map
        ref={mapRef}
        currentLocationButtonClassName="left-5 bottom-20"
        onPanDrag={handlePanDrag}
        onRegionChangeComplete={handleRegionChangeComplete}
        initialRegion={initialRegion}
        showCurrentLocationButton
        showSwitchMapTypeButton
        showsCompass={false}
        switchMapTypeButtonClassName="left-20 bottom-20"
        showsUserLocation
        tileMapParams={tileMapParams}
        withPressableObsTiles={tileMapParams !== null}
      />
      {isLoading && (
        <View style={centeredLoadingWheel}>
          <ActivityIndicator size={50} />
        </View>
      )}
    </View>
  );
};

export default MapView;
