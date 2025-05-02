import { Body2, DateTimePicker, INatIcon } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React, { useState } from "react";
import type { RealmObservationPojo } from "realmModels/types";
import {
  formatISONoSeconds,
  formatLongDate,
  formatLongDatetime
} from "sharedHelpers/dateAndTime.ts";
import useTranslation from "sharedHooks/useTranslation.ts";

interface Props {
  currentObservation: RealmObservationPojo;
  updateObservationKeys: ( { observed_on_string }: { observed_on_string: string } ) => void;
}

const DatePicker = ( { currentObservation, updateObservationKeys }: Props ) => {
  const { t, i18n } = useTranslation( );
  const [showModal, setShowModal] = useState( false );

  const openModal = () => setShowModal( true );
  const closeModal = () => setShowModal( false );

  const observationDate = currentObservation?.observed_on_string
    || currentObservation?.time_observed_at
    || currentObservation?.observed_on
    || null;

  const handlePicked = ( value: Date ) => {
    const dateString = formatISONoSeconds( value );
    updateObservationKeys( {
      observed_on_string: dateString
    } );
    closeModal();
  };

  const displayDate = ( ) => {
    const opts = {
      literalTime: !currentObservation?.observed_time_zone,
      timeZone: currentObservation?.observed_time_zone,
      missing: null
    };
    if ( String( observationDate ).includes( "T" ) ) {
      return formatLongDatetime( observationDate, i18n, opts );
    }
    return formatLongDate( observationDate, i18n, opts );
  };

  const observationDateForPicker = observationDate
    ? new Date( observationDate )
    : new Date( );

  return (
    <>
      <DateTimePicker
        date={observationDateForPicker}
        datetime
        isDateTimePickerVisible={showModal}
        onDatePicked={handlePicked}
        toggleDateTimePicker={closeModal}
      />
      <Pressable
        accessibilityRole="button"
        onPress={openModal}
        className="flex-row flex-nowrap items-center py-4"
        accessibilityLabel={t( "Select-a-date-and-time-for-observation" )}
      >
        <View className="w-[30px] items-center mr-1">
          <INatIcon size={14} name="clock-outline" />
        </View>
        {/* $FlowIgnore */}
        <Body2 testID="ObsEdit.time" className={!displayDate( ) && "color-warningRed"}>
          {displayDate( ) || t( "Add-Date-Time" )}
        </Body2>
      </Pressable>
    </>
  );
};

export default DatePicker;
