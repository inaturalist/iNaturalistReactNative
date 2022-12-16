// @flow

import DateTimePicker from "components/SharedComponents/DateTimePicker";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text } from "react-native";
import { createObservedOnStringForUpload, displayDateTimeObsEdit } from "sharedHelpers/dateAndTime";

type Props = {
  currentObservation: Object
}

const DatePicker = ( { currentObservation }: Props ): Node => {
  const { updateObservationKey } = useContext( ObsEditContext );
  const { t } = useTranslation( );
  const [showModal, setShowModal] = useState( false );

  const openModal = () => setShowModal( true );
  const closeModal = () => setShowModal( false );

  const handlePicked = value => {
    const dateString = createObservedOnStringForUpload( value );
    updateObservationKey( "observed_on_string", dateString );
    closeModal();
  };

  const displayDate = ( ) => displayDateTimeObsEdit( currentObservation?.observed_on_string ) || "";

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
