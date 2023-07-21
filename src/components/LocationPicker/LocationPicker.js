// @flow

import { useNavigation } from "@react-navigation/native";
import {
  Body3,
  CloseButton, Heading4,
  INatIconButton,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext, useEffect,
  useReducer, useRef
} from "react";
import { Dimensions, Platform } from "react-native";
import MapView from "react-native-maps";
import { ActivityIndicator, useTheme } from "react-native-paper";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import fetchUserLocation from "sharedHelpers/fetchUserLocation";
import useTranslation from "sharedHooks/useTranslation";
import { getShadowStyle } from "styles/global";

import CrosshairCircle from "./CrosshairCircle";
import DisplayLatLng from "./DisplayLatLng";
import Footer from "./Footer";
import LocationSearch from "./LocationSearch";

const { width, height } = Dimensions.get( "screen" );

const DELTA = 0.02;
const CROSSHAIRLENGTH = 254;
export const DESIRED_LOCATION_ACCURACY = 100;
export const REQUIRED_LOCATION_ACCURACY = 500000;

const estimatedAccuracy = longitudeDelta => longitudeDelta * 1000 * (
  ( CROSSHAIRLENGTH / width ) * 100 );

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 2,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 5
} );

const initialState = {
  accuracy: 0,
  accuracyTest: "pass",
  locationName: null,
  mapType: "standard",
  region: {
    latitudeDelta: DELTA,
    longitudeDelta: DELTA
  }
};

const reducer = ( state, action ) => {
  switch ( action.type ) {
    case "ESTIMATE_ACCURACY":
      return {
        ...state,
        positional_accuracy: estimatedAccuracy( state.region.longitudeDelta )
      };
    case "FETCH_CURRENT_LOCATION":
      return {
        ...state,
        loading: false,
        region: {
          ...state.region,
          latitude: action.userLocation?.latitude,
          longitude: action.userLocation?.longitude
        }
      };
    case "INITIALIZE_MAP":
      return {
        ...state,
        accuracy: action.currentObservation?.positional_accuracy,
        locationName: action.currentObservation?.place_guess,
        region: {
          ...state.region,
          latitude: action.currentObservation?.latitude,
          longitude: action.currentObservation?.longitude,
          latitudeDelta: DELTA,
          longitudeDelta: DELTA
        }
      };
    case "LOADING":
      return {
        ...state,
        loading: true
      };
    case "RESET_LOCATION_PICKER":
      return {
        ...action.initialState
      };
    case "SET_ACCURACY_TEST":
      return {
        ...state,
        accuracyTest: action.accuracyTest
      };
    case "SET_MAP_TYPE":
      return {
        ...state,
        mapType: action.mapType
      };
    case "UPDATE_LOCATION_NAME":
      return {
        ...state,
        locationName: action.locationName
      };
    case "UPDATE_REGION":
      return {
        ...state,
        locationName: action.locationName,
        region: action.region,
        accuracy: action.accuracy
      };
    default:
      throw new Error( );
  }
};

type Props = {
  route: {
    params: {
      goBackOnSave: boolean
    },
  },
};

const centerIndicator = ( height / 2 ) - 120;

const LocationPicker = ( { route }: Props ): Node => {
  const theme = useTheme( );
  const { t } = useTranslation( );
  const mapView = useRef( );
  const { currentObservation } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { goBackOnSave } = route.params;

  const [state, dispatch] = useReducer( reducer, initialState );

  const {
    accuracy,
    accuracyTest,
    loading,
    locationName,
    mapType,
    region
  } = state;

  const showMap = region.latitude && region.latitude !== 0.0;

  const keysToUpdate = {
    latitude: region.latitude,
    longitude: region.longitude,
    positional_accuracy: accuracy,
    place_guess: locationName
  };

  useEffect( ( ) => {
    if ( accuracy < DESIRED_LOCATION_ACCURACY ) {
      dispatch( { type: "SET_ACCURACY_TEST", accuracyTest: "pass" } );
    } else if ( accuracy < REQUIRED_LOCATION_ACCURACY ) {
      dispatch( { type: "SET_ACCURACY_TEST", accuracyTest: "acceptable" } );
    } else {
      dispatch( { type: "SET_ACCURACY_TEST", accuracyTest: "fail" } );
    }
  }, [accuracy] );

  const updateRegion = async newRegion => {
    const newAccuracy = estimatedAccuracy( newRegion.longitudeDelta );

    // don't update region if map hasn't actually moved
    // otherwise, it's jittery on Android
    if ( newRegion.latitude.toFixed( 6 ) === region.latitude?.toFixed( 6 )
      && newRegion.longitude.toFixed( 6 ) === region.longitude?.toFixed( 6 )
      && newRegion.latitudeDelta.toFixed( 6 ) === region.latitudeDelta?.toFixed( 6 ) ) {
      return;
    }

    const placeName = await fetchPlaceName( newRegion.latitude, newRegion.longitude );
    dispatch( {
      type: "UPDATE_REGION",
      locationName: placeName || null,
      region: newRegion,
      accuracy: newAccuracy
    } );
  };

  const toggleMapLayer = ( ) => {
    if ( mapType === "standard" ) {
      dispatch( { type: "SET_MAP_TYPE", mapType: "satellite" } );
    } else {
      dispatch( { type: "SET_MAP_TYPE", mapType: "standard" } );
    }
  };

  const returnToUserLocation = async ( ) => {
    dispatch( { type: "LOADING" } );
    const userLocation = await fetchUserLocation( );
    dispatch( { type: "FETCH_CURRENT_LOCATION", userLocation } );
    mapView.current?.getCamera().then( cam => {
      if ( Platform.OS === "android" ) {
        cam.zoom = 20;
      } else {
        cam.altitude = 100;
      }
      mapView.current?.animateCamera( cam );
    } );
    dispatch( { type: "ESTIMATE_ACCURACY" } );
  };

  const updateLocationName = name => {
    dispatch( { type: "UPDATE_LOCATION_NAME", locationName: name } );
  };

  // reset to initialState when exiting screen without saving
  useEffect(
    ( ) => {
      navigation.addListener( "focus", ( ) => {
        if ( !currentObservation ) { return; }
        dispatch( { type: "INITIALIZE_MAP", currentObservation } );
      } );
      navigation.addListener( "blur", ( ) => {
        dispatch( { type: "RESET_LOCATION_PICKER", initialState } );
      } );
    },
    [navigation, currentObservation]
  );

  return (
    <ViewWrapper testID="location-picker" className="flex-1">
      <View className="justify-center">
        <Heading4 className="self-center my-4">{t( "EDIT-LOCATION" )}</Heading4>
        <View className="absolute right-2">
          <CloseButton black size={19} />
        </View>
      </View>
      <View className="top-1/2 left-1/2 absolute z-10">
        {( showMap && !loading ) && (
          <CrosshairCircle
            accuracyTest={accuracyTest}
            getShadow={getShadow}
          />
        )}
      </View>
      <View className="flex-shrink">
        {showMap
          ? (
            <MapView
              className="h-full"
              showsCompass={false}
              region={region}
              ref={mapView}
              mapType={mapType}
              // TODO: figure out the right zoom level here
              // don't think it's necessary to let a user zoom out far beyond cities
              minZoomLevel={5}
              onRegionChangeComplete={async newRegion => {
                updateRegion( newRegion );
              }}
            />
          )
          : (
            <View className="h-full bg-lightGray items-center justify-center">
              <Body3>{t( "Try-searching-for-a-location-name" )}</Body3>
            </View>
          )}
        {loading && (
          <View
            className="bg-white absolute self-center h-[80px] w-[80px] justify-center"
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              top: centerIndicator
            }}
          >
            <ActivityIndicator large />
          </View>
        )}
        <LocationSearch
          region={region}
          setRegion={updateRegion}
          locationName={locationName}
          setLocationName={updateLocationName}
          getShadow={getShadow}
        />
        <DisplayLatLng
          region={region}
          accuracy={accuracy}
          getShadow={getShadow}
        />
        <View
          style={getShadow( theme.colors.primary )}
          className="absolute bottom-3 bg-white left-3 rounded-full"
        >
          <INatIconButton
            icon="layers"
            onPress={toggleMapLayer}
            height={46}
            width={46}
            size={24}
          />
        </View>
        <View
          style={getShadow( theme.colors.primary )}
          className="absolute bottom-3 bg-white right-3 rounded-full"
        >
          <INatIconButton
            icon="location-crosshairs"
            onPress={returnToUserLocation}
            height={46}
            width={46}
            size={24}
          />
        </View>
      </View>
      <Footer
        keysToUpdate={keysToUpdate}
        goBackOnSave={goBackOnSave}
      />
    </ViewWrapper>
  );
};

export default LocationPicker;
