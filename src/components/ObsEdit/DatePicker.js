// @flow

import { Body3, DateTimePicker } from "components/SharedComponents";
import { Pressable } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "react-native-paper";
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
        accessibilityRole="button"
        onPress={openModal}
        className="flex-row flex-nowrap items-center"
      >
        <IconButton size={14} icon="clock-outline" />
        <Body3 testID="ObsEdit.time">
          {displayDate( ) || t( "Add-Date-Time" )}
        </Body3>
      </Pressable>
    </>
  );
};

export default DatePicker;
