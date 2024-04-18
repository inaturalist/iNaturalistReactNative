// @flow

import * as React from "react";
import { Appearance } from "react-native";
import DateTimePicker from "react-native-modal-datetime-picker";

type Props = {
  toggleDateTimePicker: any,
  onDatePicked: any,
  isDateTimePickerVisible: boolean,
  datetime?: boolean
};

// using component from Seek: https://github.com/inaturalist/SeekReactNative/blob/64ae3df185fffe751aff40ab17e3ff2dd8a74e42/components/UIComponents/DateTimePicker.js

const EmptyHeader = ( ) => null;

const DatePicker = ( {
  datetime,
  isDateTimePickerVisible,
  onDatePicked,
  toggleDateTimePicker
}: Props ): React.Node => {
  const colorScheme = Appearance.getColorScheme( );

  return (
    <DateTimePicker
      display="spinner"
      customHeaderIOS={EmptyHeader}
      isDarkModeEnabled={colorScheme === "dark"}
      isVisible={isDateTimePickerVisible}
      maximumDate={new Date( )}
      mode={datetime
        ? "datetime"
        : "date"}
      onCancel={toggleDateTimePicker}
      onConfirm={date => {
        onDatePicked( date );
        toggleDateTimePicker( );
      }}
    />
  );
};

DatePicker.defaultProps = {
  datetime: false
};

export default DatePicker;
