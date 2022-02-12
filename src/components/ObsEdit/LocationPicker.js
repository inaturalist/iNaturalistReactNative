// @flow

import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { Node } from "react";

import InputField from "../SharedComponents/InputField";
import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import Map from "../SharedComponents/Map";
import { viewStyles } from "../../styles/obsEdit/locationPicker";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";

type Props = {
  closeLocationPicker: Function,
  updateLocation: Function
}

const LocationPicker = ( { closeLocationPicker, updateLocation }: Props ): Node => {
  const [searchQuery, setSearchQuery] = useState( "" );
  const [location, setLocation] = useState( {
    obsLatitude: null,
    obsLongitude: null
  } );

  console.log( searchQuery, "search" );

  const updateLocationAndClose = ( ) => {
    console.log( "do the things" );
  };

  return (
    <ViewNoFooter>
      <InputField
        handleTextChange={setSearchQuery}
        placeholder="search for location"
        text={searchQuery}
        type="addressCity"
        testID="LocationPicker.search"
      />
      <Map
      />
      <View style={viewStyles.confirmButtonFooter}>
        <RoundGreenButton
          buttonText="confirm location"
          handlePress={updateLocationAndClose}
          testID="LocationPicker.confirmButton"
        />
      </View>
    </ViewNoFooter>
  );
};

export default LocationPicker;
