// @flow

import { useNavigation } from "@react-navigation/native";
import { metersToLatitudeDelta } from "components/SharedComponents/Map/helpers/mapHelpers.ts";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useReducer
} from "react";
import { Dimensions } from "react-native";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import useStore from "stores/useStore";

import LocationPicker from "./LocationPicker";

const { width } = Dimensions.get( "screen" );

const DELTA = 0.02;
const CROSSHAIRLENGTH = 254;

const setInitialRegion = currentObservation => {
  const latitude = currentObservation?.privateLatitude
    || currentObservation?.latitude;
  const longitude = currentObservation?.privateLongitude
    || currentObservation?.longitude;

  const latitudeDelta = latitude && currentObservation?.positional_accuracy
    ? metersToLatitudeDelta(
      currentObservation?.positional_accuracy,
      latitude
    )
    : 90;
  const longitudeDelta = longitude && currentObservation?.positional_accuracy
    ? latitudeDelta
    : 180;

  return {
    // This was causing a crash when getting to the location picker before
    // current location was fetched in the observation viewer
    latitude: latitude || 0.0,
    longitude: longitude || 0.0,
    latitudeDelta,
    longitudeDelta
  };
};

const initializeMap = ( state, action ) => {
  const newMap = {
    ...state,
    accuracy: action.currentObservation?.positional_accuracy,
    locationName: action.currentObservation?.place_guess,
    region: {
      ...state.region,
      ...setInitialRegion( action.currentObservation )
    }
  };

  if ( newMap.region.latitude !== 0.0 ) {
    newMap.region.latitudeDelta = metersToLatitudeDelta(
      newMap.accuracy,
      newMap.region.latitude
    );
    newMap.region.longitudeDelta = newMap.region.latitudeDelta;
  }
  return newMap;
};

const estimatedAccuracy = longitudeDelta => longitudeDelta * 1000 * (
  ( CROSSHAIRLENGTH / width ) * 100 );

const DEFAULT_REGION = {
  latitude: 0.0,
  longitude: 0.0,
  latitudeDelta: DELTA,
  longitudeDelta: DELTA
};

const initialState = {
  accuracy: 0,
  hidePlaceResults: true,
  isFirstMapRender: true,
  loading: true,
  locationName: "",
  mapType: "standard",
  region: DEFAULT_REGION,
  regionToAnimate: null
};

const reducer = ( state, action ) => {
  switch ( action.type ) {
    case "HANDLE_CURRENT_LOCATION_PRESS":
      return {
        ...state,
        loading: true,
        isFirstMapRender: false
      };
    case "HANDLE_FIRST_MAP_RENDER":
      return {
        ...state,
        isFirstMapRender: false,
        loading: false
      };
    case "HANDLE_MAP_READY":
      return {
        ...state,
        loading: false
      };
    case "HANDLE_REGION_CHANGE":
      return {
        ...state,
        locationName: action.locationName,
        region: action.region,
        accuracy: action.accuracy,
        loading: false
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
        loading: true
      };
    case "SET_MAP_TYPE":
      return {
        ...state,
        mapType: action.mapType
      };
    case "UPDATE_LOCATION_NAME":
      return {
        ...state,
        locationName: action.locationName,
        hidePlaceResults: false
      };
    default:
      throw new Error( );
  }
};

const LocationPickerContainer = ( ): Node => {
  const resetSuggestionsSlice = useStore( state => state.resetSuggestionsSlice );
  const currentObservation = useStore( state => state.currentObservation );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const navigation = useNavigation( );

  const [state, dispatch] = useReducer( reducer, initialState );

  const {
    accuracy,
    hidePlaceResults,
    isFirstMapRender,
    loading,
    locationName,
    mapType,
    region,
    regionToAnimate
  } = state;

  const initialRegion = setInitialRegion( currentObservation );

  const onRegionChangeComplete = async newRegion => {
    // prevent initial map render from resetting the coordinates and locationName
    if ( isFirstMapRender ) {
      dispatch( { type: "HANDLE_FIRST_MAP_RENDER" } );
      return;
    }
    const newAccuracy = estimatedAccuracy( newRegion.longitudeDelta );

    const placeName = await fetchPlaceName( newRegion.latitude, newRegion.longitude );
    dispatch( {
      type: "HANDLE_REGION_CHANGE",
      locationName: placeName || "",
      region: newRegion,
      accuracy: newAccuracy
    } );
  };

  const updateLocationName = useCallback( name => {
    dispatch( { type: "UPDATE_LOCATION_NAME", locationName: name } );
  }, [] );

  // make sure map always reflects the current observation lat/lng
  useEffect(
    ( ) => {
      navigation.addListener( "focus", ( ) => {
        dispatch( { type: "INITIALIZE_MAP", currentObservation } );
      } );
    },
    [navigation, currentObservation]
  );

  const selectPlaceResult = place => {
    const { coordinates } = place.point_geojson;
    dispatch( {
      type: "SELECT_PLACE_RESULT",
      locationName: place.display_name,
      region: {
        ...region,
        latitude: coordinates[1],
        longitude: coordinates[0]
      },
      regionToAnimate: {
        ...region,
        latitude: coordinates[1],
        longitude: coordinates[0]
      }
    } );
  };

  const onCurrentLocationPress = ( ) => dispatch( { type: "HANDLE_CURRENT_LOCATION_PRESS" } );
  const onMapReady = ( ) => dispatch( { type: "HANDLE_MAP_READY" } );

  const handleSave = ( ) => {
    resetSuggestionsSlice( );
    const keysToUpdate = {
      latitude: region.latitude,
      longitude: region.longitude,
      positional_accuracy: accuracy,
      place_guess: locationName
    };

    updateObservationKeys( keysToUpdate );
    navigation.goBack( );
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
    />
  );
};

export default LocationPickerContainer;
