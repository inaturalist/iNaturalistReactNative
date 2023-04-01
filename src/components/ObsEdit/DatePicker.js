// @flow

import DateTimePicker from "components/SharedComponents/DateTimePicker";
import { Pressable, Text } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useState } from "react";
import { IconButton } from "react-native-paper";
import { createObservedOnStringForUpload, displayDateTimeObsEdit } from "sharedHelpers/dateAndTime";
import useTranslation from "sharedHooks/useTranslation";

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
        className="flex-row flex-nowrap items-center"
      >
        <IconButton size={14} icon="clock-outline" />
        <Text testID="ObsEdit.time">
          {displayDate( ) || t( "Add-Date-Time" )}
        </Text>
      </Pressable>
    </>
  );
};

export default DatePicker;
