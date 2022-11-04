// @flow

import PhotoCarousel from "components/SharedComponents/PhotoCarousel";
import { Text, View } from "components/styledComponents";
import { UploadContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { createObservedOnStringForUpload } from "sharedHelpers/dateAndTime";

import DatePicker from "./DatePicker";

type Props = {
  handleSelection: Function,
  photoUris: Array<string>,
  handleAddEvidence?: Function
}

const EvidenceSection = ( {
  handleSelection,
  handleAddEvidence,
  photoUris
}: Props ): Node => {
  const {
    currentObs,
    updateObservationKey
  } = useContext( UploadContext );
  const { t } = useTranslation( );

  const formatDecimal = coordinate => coordinate && coordinate.toFixed( 6 );

  const updateObservedOn = value => updateObservationKey( "observed_on_string", value );

  const latitude = currentObs?.latitude;
  const longitude = currentObs?.longitude;

  const handleDatePicked = selectedDate => {
    if ( selectedDate ) {
      const dateString = createObservedOnStringForUpload( selectedDate );
      updateObservedOn( dateString );
    }
  };

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
    <View className="mx-5">
      <PhotoCarousel
        photoUris={photoUris}
        setSelectedPhotoIndex={handleSelection}
        showAddButton
        handleAddEvidence={handleAddEvidence}
      />
      <Text>{currentObs.place_guess}</Text>
      <Text>{displayLocation( ) || t( "No-Location" )}</Text>
      <DatePicker currentObs={currentObs} handleDatePicked={handleDatePicked} />
    </View>
  );
};

export default EvidenceSection;
