// @flow

import { useNavigation } from "@react-navigation/native";
import {
  CloseButton, Heading4,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback,
  useContext, useEffect, useRef, useState
} from "react";
import { Dimensions } from "react-native";
import MapView from "react-native-maps";
import { IconButton, useTheme } from "react-native-paper";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import fetchUserLocation from "sharedHelpers/fetchUserLocation";
import useTranslation from "sharedHooks/useTranslation";
import { getShadowStyle } from "styles/global";

// import CrosshairCircle from "./CrosshairCircle";
import DisplayLatLng from "./DisplayLatLng";
import Footer from "./Footer";
import LocationSearch from "./LocationSearch";
import WarningText from "./WarningText";

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 2,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 5
} );

const { width } = Dimensions.get( "screen" );

const DELTA = 0.2;
const CROSSHAIRLENGTH = 244;
const DESIRED_LOCATION_ACCURACY = 4000000;

type Props = {
  route: {
    params: {
      goBackOnSave: boolean
    },
  },
};

const LocationPicker = ( { route }: Props ): Node => {
  const theme = useTheme( );
  const { t } = useTranslation( );
  const mapView = useRef( );
  const { currentObservation } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { goBackOnSave } = route.params;
  const [mapType, setMapType] = useState( "standard" );
  const [locationName, setLocationName] = useState( currentObservation?.place_guess );
  const [accuracy, setAccuracy] = useState( currentObservation?.positional_accuracy );
  const [accuracyTest, setAccuracyTest] = useState( "pass" );
  const [region, setRegion] = useState( {
    latitude: currentObservation?.latitude || 0.0,
    longitude: currentObservation?.longitude || 0.0,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA
  } );

  const keysToUpdate = {
    latitude: region.latitude,
    longitude: region.longitude,
    positional_accuracy: accuracy,
    place_guess: locationName
  };

  useEffect( ( ) => {
    if ( accuracy < 10 ) {
      setAccuracyTest( "pass" );
    } else if ( accuracy < DESIRED_LOCATION_ACCURACY ) {
      setAccuracyTest( "acceptable" );
    } else {
      setAccuracyTest( "fail" );
    }
  }, [accuracy] );

  const updateRegion = async newRegion => {
    const estimatedAccuracy = newRegion.longitudeDelta * 1000 * (
      ( CROSSHAIRLENGTH / width ) * 100
    );

    const placeName = await fetchPlaceName( newRegion.latitude, newRegion.longitude );
    if ( placeName ) {
      setLocationName( placeName );
    }
    setRegion( newRegion );
    setAccuracy( estimatedAccuracy );
  };

  const renderBackButton = useCallback(
    ( ) => <CloseButton black className="absolute" size={19} />,
    []
  );

  useEffect( ( ) => {
    const renderHeaderTitle = ( ) => <Heading4>{t( "EDIT-LOCATION" )}</Heading4>;

    const headerOptions = {
      headerRight: renderBackButton,
      headerTitle: renderHeaderTitle
    };

    navigation.setOptions( headerOptions );
  }, [renderBackButton, navigation, t] );

  const toggleMapLayer = ( ) => {
    if ( mapType === "standard" ) {
      setMapType( "satellite" );
    } else {
      setMapType( "standard" );
    }
  };

  const returnToUserLocation = async ( ) => {
    const userLocation = await fetchUserLocation( );
    setRegion( {
      ...region,
      latitude: userLocation?.latitude,
      longitude: userLocation?.longitude
    } );
  };

  return (
    <ViewWrapper testID="location-picker">
      <MapView
        className="flex-1 items-center justify-center"
        region={region}
        ref={mapView}
        mapType={mapType}
        onRegionChangeComplete={async newRegion => {
          updateRegion( newRegion );
          // console.log( await mapView?.current?.getMapBoundaries( ) );
        }}
      />
      {/* <MapView
        className="flex-1 items-center justify-center"
        region={region}
        ref={mapView}
        onRegionChangeComplete={async newRegion => {
          updateRegion( newRegion );
          // console.log( await mapView?.current?.getMapBoundaries( ) );
        }}
      >
        <CrosshairCircle accuracyTest={accuracyTest} />
      </MapView> */}
      <LocationSearch
        region={region}
        setRegion={setRegion}
        locationName={locationName}
      />
      <DisplayLatLng
        region={region}
        accuracy={accuracy}
        getShadow={getShadow}
      />
      <WarningText accuracyTest={accuracyTest} getShadow={getShadow} />
      <View style={getShadow( theme.colors.primary )}>
        <IconButton
          className="absolute bottom-20 bg-white left-2"
          icon="layers"
          onPress={toggleMapLayer}
        />
      </View>
      <View style={getShadow( theme.colors.primary )}>
        <IconButton
          className="absolute bottom-20 bg-white right-2"
          icon="location-crosshairs"
          onPress={returnToUserLocation}
        />
      </View>
      <Footer
        keysToUpdate={keysToUpdate}
        goBackOnSave={goBackOnSave}
      />
    </ViewWrapper>
  );
};

export default LocationPicker;
