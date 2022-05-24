// @flow

import React, { useState, useContext } from "react";
import { Text, Pressable, Modal } from "react-native";
import type { Node } from "react";
import { useTranslation } from "react-i18next";

import { textStyles } from "../../styles/obsEdit/obsEdit";
import LocationPicker from "./LocationPicker";
import { ObsEditContext } from "../../providers/contexts";
import DatePicker from "./DatePicker";
import { createObservedOnStringForUpload } from "../../sharedHelpers/dateAndTime";
import PhotoCarousel from "../SharedComponents/PhotoCarousel";

type Props = {
  handleSelection: Function
}

const EvidenceSection = ( {
  handleSelection
}: Props ): Node => {
  const {
    currentObsIndex,
    observations,
    setObservations,
    updateObservationKey
  } = useContext( ObsEditContext );
  const { t } = useTranslation( );
  const [showLocationPicker, setShowLocationPicker] = useState( false );

  const formatDecimal = coordinate => coordinate && coordinate.toFixed( 6 );

  const updateObservedOn = value => updateObservationKey( "observed_on_string", value );

  const currentObs = observations[currentObsIndex];
  const latitude = currentObs && currentObs.latitude;
  const longitude = currentObs && currentObs.longitude;

  const openLocationPicker = ( ) => setShowLocationPicker( true );
  const closeLocationPicker = ( ) => setShowLocationPicker( false );

  const updateLocation = newLocation => {
    const updatedObs = observations.map( ( obs, index ) => {
      if ( index === currentObsIndex ) {
        return {
          ...obs,
          // $FlowFixMe
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          place_guess: newLocation.placeGuess
        };
      } else {
        return obs;
      }
    } );
    setObservations( updatedObs );
  };

  const handleDatePicked = ( selectedDate ) => {
    if ( selectedDate ) {
      const dateString = createObservedOnStringForUpload( selectedDate );
      updateObservedOn( dateString );
    }
  };

  const renderLocationPickerModal = ( ) => (
    <Modal visible={showLocationPicker}>
      <LocationPicker
        closeLocationPicker={closeLocationPicker}
        updateLocation={updateLocation}
      />
    </Modal>
  );

  const displayLocation = ( ) => {
    let location = "";
    if ( latitude ) {
      location += `Lat: ${formatDecimal( latitude )}`;
    }
    if ( longitude ) {
      location += `, Lon: ${formatDecimal( longitude )}`;
    }
    if ( currentObs.positional_accuracy ) {
      location += `, Acc: ${formatDecimal( currentObs.positional_accuracy )}`;
    }
    return location;
  };

  return (
    <>
      {renderLocationPickerModal( )}
      {/* TODO: allow user to tap into bigger version of photo (crop screen) */}
      <PhotoCarousel
        photos={currentObs.observationPhotos}
        setSelectedPhoto={handleSelection}
      />
      <Pressable
        onPress={openLocationPicker}
      >
        <Text style={textStyles.text}>
          {currentObs.place_guess || t( "Add-Location" )}
        </Text>
        <Text style={textStyles.text}>
          {displayLocation( ) || t( "No-Location" )}
        </Text>
      </Pressable>
      <DatePicker currentObs={currentObs} handleDatePicked={handleDatePicked} />
    </>
  );
};

export default EvidenceSection;
