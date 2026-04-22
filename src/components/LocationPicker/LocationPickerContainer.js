// @flow

import { useNavigation } from "@react-navigation/native";
import {
  latitudeDeltaToMeters,
  metersToLatitudeDelta,
} from "components/SharedComponents/Map/helpers/mapHelpers";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import useStore from "stores/useStore";

import LocationPicker from "./LocationPicker";

const CROSSHAIRRADIUS = 254 / 2;

const setInitialRegion = ( currentObservation, radiusToMapHeight, mapDimensionsRatio ) => {
  if ( !radiusToMapHeight || !mapDimensionsRatio ) {
    return null;
  }
  const latitude = currentObservation?.privateLatitude
    || currentObservation?.latitude;
  const longitude = currentObservation?.privateLongitude
    || currentObservation?.longitude;

  const latitudeDelta = latitude && currentObservation?.positional_accuracy
    // We want to show the map zoomed to the exact level where the radius of the crosshair on top
    // represents the positional accuracy of the observation, so we need to convert the positional
    // accuracy in meters to a latitude delta and then adjust based on the ratio of the crosshair
    // radius to the map height.
    ? metersToLatitudeDelta(
      currentObservation?.positional_accuracy,
      latitude,
    ) / radiusToMapHeight
    : 90;
  const longitudeDelta = longitude && currentObservation?.positional_accuracy
    ? latitudeDelta * mapDimensionsRatio
    : 180;

  return {
    // This was causing a crash when getting to the location picker before
    // current location was fetched in the observation viewer
    latitude: latitude || 0.0,
    longitude: longitude || 0.0,
    latitudeDelta,
    longitudeDelta,
  };
};

const initializeMap = ( state, action ) => {
  const newMap = {
    ...state,
    accuracy: action.currentObservation?.positional_accuracy,
    locationName: action.currentObservation?.place_guess,
  };
  const initialRegion = setInitialRegion(
    action.currentObservation,
    action.radiusToMapHeight,
    action.mapDimensionsRatio,
  );
  if ( initialRegion !== null ) {
    newMap.region = initialRegion;
  }
  return newMap;
};

const initialState = {
  accuracy: 0,
  hidePlaceResults: true,
  isFirstMapRender: true,
  loading: true,
  locationName: "",
  mapType: "standard",
  region: undefined,
  regionToAnimate: undefined,
};

const reducer = ( state, action ) => {
  switch ( action.type ) {
    case "HANDLE_CURRENT_LOCATION_PRESS":
      return {
        ...state,
        loading: true,
        isFirstMapRender: false,
      };
    case "HANDLE_FIRST_MAP_RENDER":
      return {
        ...state,
        isFirstMapRender: false,
        loading: false,
      };
    case "HANDLE_MAP_READY":
      return {
        ...state,
        loading: false,
      };
    case "HANDLE_REGION_CHANGE":
      return {
        ...state,
        locationName: action.locationName,
        region: action.region,
        accuracy: action.accuracy,
        loading: false,
      };
    case "INITIALIZE_MAP": {
      const newMap = initializeMap( state, action );
      return newMap;
    }
    case "SELECT_PLACE_RESULT":
      return {
        ...state,
        locationName: action.locationName,
        region: action.region,
        hidePlaceResults: true,
        regionToAnimate: action.region,
        loading: true,
      };
    case "SET_MAP_TYPE":
      return {
        ...state,
        mapType: action.mapType,
      };
    case "UPDATE_LOCATION_NAME":
      return {
        ...state,
        locationName: action.locationName,
        hidePlaceResults: false,
      };
    default:
      throw new Error( );
  }
};

const LocationPickerContainer = ( ): Node => {
  const currentObservation = useStore( state => state.currentObservation );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const navigation = useNavigation( );

  const [state, dispatch] = useReducer( reducer, initialState );
  const [radiusToMapHeight, setRadiusToMapHeight] = useState( undefined );
  const [mapDimensionsRatio, setMapDimensionsRatio] = useState( undefined );

  const {
    accuracy,
    hidePlaceResults,
    isFirstMapRender,
    loading,
    locationName,
    mapType,
    region,
    regionToAnimate,
  } = state;

  const initialRegion = setInitialRegion(
    currentObservation,
    radiusToMapHeight,
    mapDimensionsRatio,
  );

  const onRegionChangeComplete = useCallback( async newRegion => {
    // prevent initial map render from resetting the coordinates and locationName
    if ( isFirstMapRender ) {
      dispatch( { type: "HANDLE_FIRST_MAP_RENDER" } );
      return;
    }
    // We need this ratio to calculate accuracy
    if ( radiusToMapHeight === undefined ) {
      return;
    }
    // We calculate accuracy in meters as the distance represented by the radius of the crosshair
    // circle on top of the map. The circle has a fixed size in pixels the map height can vary
    // by device. We convert to meters based on the current map zoom level (latitudeDelta) and
    // the ratio of the crosshair radius to the map height.
    const newAccuracy = radiusToMapHeight
      * latitudeDeltaToMeters( newRegion.latitudeDelta, newRegion.latitude );

    const placeName = await fetchPlaceName( newRegion.latitude, newRegion.longitude );
    dispatch( {
      type: "HANDLE_REGION_CHANGE",
      locationName: placeName || "",
      region: newRegion,
      accuracy: newAccuracy,
    } );
  }, [isFirstMapRender, radiusToMapHeight] );

  const updateLocationName = useCallback( name => {
    dispatch( { type: "UPDATE_LOCATION_NAME", locationName: name } );
  }, [] );

  // make sure map always reflects the current observation lat/lng
  useEffect(
    ( ) => {
      const unsubscribe = navigation.addListener( "focus", ( ) => {
        dispatch( {
          type: "INITIALIZE_MAP", currentObservation, radiusToMapHeight, mapDimensionsRatio,
        } );
      } );

      return unsubscribe;
    },
    [navigation, currentObservation, radiusToMapHeight, mapDimensionsRatio],
  );

  const selectPlaceResult = place => {
    const { coordinates } = place.point_geojson;
    dispatch( {
      type: "SELECT_PLACE_RESULT",
      locationName: place.display_name,
      region: {
        ...region,
        latitude: coordinates[1],
        longitude: coordinates[0],
      },
      regionToAnimate: {
        ...region,
        latitude: coordinates[1],
        longitude: coordinates[0],
      },
    } );
  };

  const onCurrentLocationPress = ( ) => dispatch( { type: "HANDLE_CURRENT_LOCATION_PRESS" } );
  const onMapReady = useCallback( ( ) => dispatch( { type: "HANDLE_MAP_READY" } ), [] );

  const handleSave = ( ) => {
    if ( region ) {
      const keysToUpdate = {
        latitude: region.latitude,
        longitude: region.longitude,
        positional_accuracy: accuracy,
        place_guess: locationName,
      };
      updateObservationKeys( keysToUpdate );
    }
    navigation.goBack( );
  };

  const onMapLayout = event => {
    const { height, width } = event.nativeEvent.layout;
    setRadiusToMapHeight( CROSSHAIRRADIUS / height );
    setMapDimensionsRatio( width / height );
  };

  return (
    <LocationPicker
      accuracy={accuracy}
      handleSave={handleSave}
      hidePlaceResults={hidePlaceResults}
      loading={loading}
      locationName={locationName}
      initialRegion={initialRegion}
      mapType={mapType}
      onCurrentLocationPress={onCurrentLocationPress}
      onMapReady={onMapReady}
      onRegionChangeComplete={onRegionChangeComplete}
      region={region}
      regionToAnimate={regionToAnimate}
      selectPlaceResult={selectPlaceResult}
      updateLocationName={updateLocationName}
      onMapLayout={onMapLayout}
    />
  );
};

export default LocationPickerContainer;
