// @flow

import { Body3, DateTimePicker, INatIcon } from "components/SharedComponents";
import { Pressable } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useState } from "react";
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
      >
        <INatIcon size={14} name="clock-outline" />
        {/* $FlowIgnore */}
        <Body3 testID="ObsEdit.time" className={`ml-5 ${!displayDate( ) && "color-warningRed"}`}>
          {displayDate( ) || t( "Add-Date-Time" )}
        </Body3>
      </Pressable>
    </>
  );
};

export default DatePicker;
