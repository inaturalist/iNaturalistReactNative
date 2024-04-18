// @flow

import { Body3, DateTimePicker, INatIcon } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { createObservedOnStringForUpload, displayDateTimeObsEdit } from "sharedHelpers/dateAndTime";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  currentObservation: object,
  updateObservationKeys: ( ) => void
}

const DatePicker = ( { currentObservation, updateObservationKeys }: Props ): Node => {
  const { t } = useTranslation( );
  const [showModal, setShowModal] = useState( false );

  const openModal = () => setShowModal( true );
  const closeModal = () => setShowModal( false );

  const handlePicked = value => {
    const dateString = createObservedOnStringForUpload( value );
    updateObservationKeys( {
      observed_on_string: dateString
    } );
    closeModal();
  };

  const displayDate = ( ) => displayDateTimeObsEdit(
    currentObservation?.observed_on_string || currentObservation?.time_observed_at
  );

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
        accessibilityLabel={t( "Select-a-date-and-time-for-observation" )}
      >
        <View className="w-[30px] items-center mr-1">
          <INatIcon size={14} name="clock-outline" />
        </View>
        {/* $FlowIgnore */}
        <Body3 testID="ObsEdit.time" className={!displayDate( ) && "color-warningRed"}>
          {displayDate( ) || t( "Add-Date-Time" )}
        </Body3>
      </Pressable>
    </>
  );
};

export default DatePicker;
