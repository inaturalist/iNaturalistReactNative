// @flow

import { Button } from "components/SharedComponents";
import InputField from "components/SharedComponents/InputField";
import Map from "components/SharedComponents/Map";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import useCoords from "sharedHooks/useCoords";
import useTranslation from "sharedHooks/useTranslation";
import { viewStyles } from "styles/obsEdit/locationPicker";

type Props = {
  closeLocationPicker: Function,
  updateLocation: Function,
};

const LocationPicker = ( {
  closeLocationPicker,
  updateLocation
}: Props ): Node => {
  const { t } = useTranslation( );
  const [searchQuery, setSearchQuery] = useState( "" );
  const [region, setRegion] = useState( {
    latitude: null,
    longitude: null
  } );

  const locationName = fetchPlaceName( region.latitude, region.longitude );
  const newCoords = useCoords( searchQuery );

  const updateLocationAndClose = () => {
    updateLocation( {
      latitude: region.latitude,
      longitude: region.longitude,
      placeGuess: locationName
    } );
    closeLocationPicker();
  };

  useEffect( () => {
    // update region when user types search term
    if ( !searchQuery ) {
      return;
    }
    if ( newCoords.latitude !== null && newCoords.latitude !== region.latitude ) {
      setRegion( newCoords );
    }
  }, [newCoords, region, searchQuery] );

  const updateCoords = newMapRegion => {
    setSearchQuery( "" );
    setRegion( newMapRegion );
  };

  return (
    <ViewWrapper>
      <InputField
        handleTextChange={setSearchQuery}
        placeholder={locationName || ""}
        text={searchQuery}
        type="addressCity"
        testID="LocationPicker.search"
      />
      <Map updateCoords={updateCoords} region={region} mapHeight={600} />
      <View style={viewStyles.confirmButtonFooter}>
        <Button
          level="focus"
          text={t( "confirm location" )}
          onPress={updateLocationAndClose}
          testID="LocationPicker.confirmButton"
        />
      </View>
    </ViewWrapper>
  );
};

export default LocationPicker;
