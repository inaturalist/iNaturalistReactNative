// @flow

import React, { useState } from "react";
import { Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import type { Node } from "react";

import { textStyles } from "../../styles/obsEdit/obsEdit";

import DateTimePicker from "../SharedComponents/DateTimePicker";

type Props = {
  displayDate: ?string,
  handleDatePicked: ( Date ) => void
}

const DatePicker = ( { displayDate, handleDatePicked }: Props ): Node => {
  const { t } = useTranslation( );
  const [showModal, setShowModal] = useState( false );

  const openModal = () => setShowModal( true );
  const closeModal = () => setShowModal( false );

  const handlePicked = ( value ) => {
    handleDatePicked( value );
    closeModal();
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
           {displayDate || t( "Add-Date-Time" )}
        </Text>
      </Pressable>
    </>
  );
};

export default DatePicker;
