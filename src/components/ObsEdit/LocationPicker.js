// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import {
  Body4,
  Button, SearchBar, StickyToolbar, ViewWrapper
} from "components/SharedComponents";
import Body3 from "components/SharedComponents/Typography/Body3";
import { View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext, useEffect, useRef, useState
} from "react";
import { Dimensions } from "react-native";
import MapView from "react-native-maps";
import { useTheme } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";
import { getShadowStyle } from "styles/global";

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 2,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 5
} );

const DELTA = 0.2;
const CROSSHAIRLENGTH = 244;

type Props = {
  route: {
    params: {
      goBackOnSave: boolean
    },
  },
};

const LocationPicker = ( { route }: Props ): Node => {
  const mapView = useRef( );
  const {
    currentObservation
    // updateObservationKeys
  } = useContext( ObsEditContext );
  const theme = useTheme( );
  const navigation = useNavigation( );
  const { goBackOnSave } = route.params;
  const { t } = useTranslation( );
  const [locationName, setLocationName] = useState( currentObservation?.place_guess );
  const [accuracy, setAccuracy] = useState( currentObservation?.positional_accuracy );
  const [accuracyTest, setAccuracyTest] = useState( "pass" );
  const [region, setRegion] = useState( {
    latitude: currentObservation?.latitude || 0.0,
    longitude: currentObservation?.longitude || 0.0,
    latitudeDelta: DELTA,
    longitudeDelta: DELTA
  } );

  const formatDecimal = coordinate => coordinate && coordinate.toFixed( 6 );

  const displayLocation = ( ) => {
    let location = "";
    if ( region.latitude ) {
      location += `Lat: ${formatDecimal( region.latitude )}`;
    }
    if ( region.longitude ) {
      location += `, Lon: ${formatDecimal( region.longitude )}`;
    }
    if ( accuracy ) {
      location += `, Acc: ${accuracy.toFixed( 0 )}`;
    }
    return location;
  };

  useEffect( ( ) => {
    if ( accuracy < 10 ) {
      setAccuracyTest( "pass" );
    } else if ( accuracy < 4000000 ) {
      setAccuracyTest( "acceptable" );
    } else {
      setAccuracyTest( "fail" );
    }
  }, [accuracy] );

  // const locationName = fetchPlaceName( region.latitude, region.longitude );
  // const newCoords = useCoords( searchQuery );

  // useEffect( () => {
  //   // update region when user types search term
  //   if ( !searchQuery ) {
  //     return;
  //   }
  //   if ( newCoords.latitude !== null && newCoords.latitude !== region.latitude ) {
  //     setRegion( newCoords );
  //   }
  // }, [newCoords, region, searchQuery] );

  const updateRegion = newRegion => {
    const { width } = Dimensions.get( "screen" );

    const estimatedAccuracy = newRegion.longitudeDelta * 1000 * (
      ( CROSSHAIRLENGTH / width ) * 100
    );

    setRegion( newRegion );
    setAccuracy( estimatedAccuracy );
  };

  const displayWarningText = ( ) => {
    if ( accuracyTest === "acceptable" ) {
      return t( "Zoom-in" );
    }
    if ( accuracyTest === "fail" ) {
      return t( "Location-accuracy-is-too-imprecise" );
    }
    return null;
  };

  useEffect( ( ) => {

  }, [] );

  return (
    <ViewWrapper>
      <MapView
        className="flex-1 items-center justify-center"
        initialRegion={region}
        onRegionChange={updateRegion}
        ref={mapView}
        onRegionChangeComplete={async ( ) => {
          console.log( await mapView?.current?.getMapBoundaries( ) );
        }}
      >
        <View
          className={classnames( "h-[254px] w-[254px] bg-transparent rounded-full border-[5px]", {
            "border-inatGreen": accuracyTest === "pass",
            "border-warningYellow border-dashed": accuracyTest === "acceptable",
            "border-warningRed": accuracyTest === "fail"
          } )}
        />
        {/* vertical crosshair */}
        <View className={`h-[${CROSSHAIRLENGTH}px] border absolute border-darkGray`} />
        {/* horizontal crosshair */}
        <View className={`w-[${CROSSHAIRLENGTH}px] border absolute border-darkGray`} />
      </MapView>
      <SearchBar
        onChangeText={text => setLocationName( text )}
        placeholder={locationName}
        testID="LocationPicker.locationSearch"
        containerClass="absolute top-[20px] right-[26px] left-[26px]"
      />
      <View className="bg-white h-[27px] rounded-lg absolute top-[74px] right-[26px] left-[26px]">
        <Body4
          className="pt-[7px] pl-[14px]"
          style={getShadow( theme.colors.primary )}
        >
          {displayLocation( )}
        </Body4>
      </View>
      <View className="justify-center items-center">
        <View
          className={classnames( "p-4 rounded-xl bottom-[180px] max-w-[316px]", {
            "bg-transparent": accuracyTest === "pass",
            "bg-white": accuracyTest === "acceptable",
            "bg-warningRed": accuracyTest === "fail"
          } )}
        >
          <Body3
            className={classnames( "text-black", {
              "text-white": accuracyTest === "fail"
            } )}
          >
            {displayWarningText( )}
          </Body3>
        </View>
      </View>
      <StickyToolbar containerClass="bottom-6">
        <Button
          className="px-[25px]"
          onPress={( ) => {
            if ( goBackOnSave ) {
              navigation.goBack();
            }
          }}
          testID="LocationPicker.saveButton"
          text={t( "SAVE-LOCATION" )}
          level="neutral"
        />
      </StickyToolbar>
      {/* <InputField
        handleTextChange={setSearchQuery}
        placeholder={locationName || ""}
        text={searchQuery}
        type="addressCity"
        testID="LocationPicker.search"
      />
 */}
    </ViewWrapper>
  );
};

export default LocationPicker;
