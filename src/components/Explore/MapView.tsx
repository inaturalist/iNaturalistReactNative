import {
  ActivityIndicator,
  Button,
  Map
} from "components/SharedComponents";
import { getMapRegion } from "components/SharedComponents/Map/helpers/mapHelpers";
import { View } from "components/styledComponents";
import {
  EXPLORE_ACTION, MapBoundaries, PLACE_MODE, useExplore
} from "providers/ExploreContext";
import React, {
  useEffect, useMemo, useRef, useState
} from "react";
import { Region } from "react-native-maps";
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

const activityIndicatorSize = 50;
const centeredLoadingWheel = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: [
    { translateX: -( activityIndicatorSize / 2 ) },
    { translateY: -( activityIndicatorSize / 2 ) }
  ],
  backgroundColor: "rgba(0,0,0,0)",
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
  isLoading: boolean,
  hasLocationPermissions?: boolean,
  renderLocationPermissionsGate: Function,
  requestLocationPermissions: Function
}

const MapView = ( {
  observationBounds,
  queryParams,
  isLoading,
  hasLocationPermissions,
  renderLocationPermissionsGate,
  requestLocationPermissions
}: Props ) => {
  const { t } = useTranslation( );
  const { state: exploreState, dispatch, defaultExploreLocation } = useExplore( );
  const [showRedoSearchButton, setShowRedoSearchButton] = useState( false );
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

    if ( mapRef.current
      && exploreState.placeMode === PLACE_MODE.MAP_AREA ) {
      return;
    }

    // since we're using initialRegion, we need to animate to the correct zoom level
    // when a user switches back to NEARBY or WORLDWIDE
    if ( mapRef.current
        && exploreState.placeMode === PLACE_MODE.NEARBY ) {
      // Note: we do get observationBounds back from the API for nearby
      // but per user feedback, we want to show users a more zoomed in view
      // when they're looking at NEARBY view
      if ( nearbyRegion.latitude !== undefined && nearbyRegion.longitude !== undefined ) {
        mapRef.current.animateToRegion( nearbyRegion );
      }
      return;
    }
    if ( mapRef.current
      && exploreState.placeMode === PLACE_MODE.WORLDWIDE ) {
      mapRef.current.animateToRegion( worldwideRegion );
    }
    if ( mapRef.current
      && exploreState.placeMode === PLACE_MODE.PLACE ) {
      if ( observationBounds ) {
        const newRegion = getMapRegion( observationBounds );
        mapRef.current.animateToRegion( newRegion );
      }
    }
  }, [
    exploreState.placeMode,
    nearbyRegion,
    regionFromCoordinates,
    observationBounds,
    exploreState.place?.id
  ] );

  const handleRedoSearch = async ( ) => {
    setShowRedoSearchButton( false );
    const currentBounds = await mapRef?.current?.getMapBoundaries( );
    dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_MAP_AREA } );
    dispatch( {
      type: EXPLORE_ACTION.SET_MAP_BOUNDARIES,
      mapBoundaries: {
        swlat: currentBounds.southWest.latitude,
        swlng: currentBounds.southWest.longitude,
        nelat: currentBounds.northEast.latitude,
        nelng: currentBounds.northEast.longitude
      }
    } );
  };

  const tileMapParams = {
    ...queryParams
  };
  // Tile queries never need these params
  delete tileMapParams.return_bounds;
  delete tileMapParams.order;
  delete tileMapParams.orderBy;

  const initialRegion: Region = useMemo( () => {
    if ( exploreState.placeMode === PLACE_MODE.NEARBY ) {
      if ( nearbyRegion.latitude !== undefined && nearbyRegion.longitude !== undefined ) {
        return nearbyRegion;
      }
    }

    if ( exploreState.placeMode === PLACE_MODE.PLACE ) {
      if ( regionFromCoordinates ) {
        return regionFromCoordinates;
      }
    }

    return worldwideRegion;
  }, [exploreState.placeMode, nearbyRegion, regionFromCoordinates] );

  const handlePanDrag = ( ) => setShowRedoSearchButton( true );

  const handleCurrentLocationPress = async ( ) => {
    if ( hasLocationPermissions ) {
      const exploreLocation = await defaultExploreLocation( );
      dispatch( {
        type: EXPLORE_ACTION.SET_EXPLORE_LOCATION,
        exploreLocation
      } );
    } else {
      requestLocationPermissions( );
    }
  };

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
        initialRegion={initialRegion}
        showCurrentLocationButton
        showSwitchMapTypeButton
        showsCompass={false}
        switchMapTypeButtonClassName="left-20 bottom-20"
        showsUserLocation
        tileMapParams={tileMapParams}
        withPressableObsTiles={tileMapParams !== null}
        onCurrentLocationPress={handleCurrentLocationPress}
        isLoading={isLoading}
      />
      {isLoading && (
        <View style={centeredLoadingWheel} testID="activity-indicator">
          <ActivityIndicator size={activityIndicatorSize} />
        </View>
      )}
      {renderLocationPermissionsGate( { onPermissionGranted: handleCurrentLocationPress } )}
    </View>
  );
};

export default MapView;
