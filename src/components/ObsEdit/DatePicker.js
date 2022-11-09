// @flow

import DateTimePicker from "components/SharedComponents/DateTimePicker";
import type { Node } from "react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text } from "react-native";
import { displayDateTimeObsEdit } from "sharedHelpers/dateAndTime";

type Props = {
  handleDatePicked: ( Date ) => void,
  currentObservation: Object
}

const DatePicker = ( { handleDatePicked, currentObservation }: Props ): Node => {
  const { t } = useTranslation( );
  const [showModal, setShowModal] = useState( false );

  const openModal = () => setShowModal( true );
  const closeModal = () => setShowModal( false );

  const handlePicked = value => {
    handleDatePicked( value );
    closeModal();
  };

  const displayDate = ( ) => {
    if ( currentObservation.observed_on_string ) {
      return displayDateTimeObsEdit( currentObservation.observed_on_string );
    } if ( currentObservation.time_observed_at ) {
      // this is for observations already uploaded to iNat
      return displayDateTimeObsEdit( currentObservation.time_observed_at );
    }
    return "";
  };

  return (
    <>
      <DateTimePicker
        datetime
        isDateTimePickerVisible={showModal}
        onDatePicked={handlePicked}
        toggleDateTimePicker={closeModal}
      />
      <Pressable
        onPress={openModal}
      >
        <Text testID="ObsEdit.time">
          {displayDate( ) || t( "Add-Date-Time" )}
        </Text>
      </Pressable>
    </>
  );
};

export default DatePicker;
