// @flow

import React, { useState } from "react";
import { Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import type { Node } from "react";

import { textStyles } from "../../styles/obsEdit/obsEdit";
import { displayDateTimeObsEdit } from "../../sharedHelpers/dateAndTime";
import DateTimePicker from "../SharedComponents/DateTimePicker";

type Props = {
  handleDatePicked: ( Date ) => void,
  currentObs: Object
}

const DatePicker = ( { handleDatePicked, currentObs }: Props ): Node => {
  const { t } = useTranslation( );
  const [showModal, setShowModal] = useState( false );

  const openModal = () => setShowModal( true );
  const closeModal = () => setShowModal( false );

  const handlePicked = value => {
    handleDatePicked( value );
    closeModal();
  };

  const displayDate = ( ) => {
    if ( currentObs.observed_on_string ) {
      return displayDateTimeObsEdit( currentObs.observed_on_string );
    } if ( currentObs.time_observed_at ) {
      // this is for observations already uploaded to iNat
      return displayDateTimeObsEdit( currentObs.time_observed_at );
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
        <Text style={textStyles.text} testID="ObsEdit.time">
          {displayDate( ) || t( "Add-Date-Time" )}
        </Text>
      </Pressable>
    </>
  );
};

export default DatePicker;
