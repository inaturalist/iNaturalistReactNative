import * as React from "react";
import DateTimePicker from "react-native-modal-datetime-picker";

type PickerMode = "date" | "time" | "datetime";

interface Props {
  date?: Date;
  toggleDateTimePicker: () => void;
  onDatePicked: ( date: Date ) => void;
  isDateTimePickerVisible: boolean;
  mode?: PickerMode;
}

// using component from Seek: https://github.com/inaturalist/SeekReactNative/blob/64ae3df185fffe751aff40ab17e3ff2dd8a74e42/components/UIComponents/DateTimePicker.js

const EmptyHeader = ( ) => null;

const DatePicker = ( {
  date,
  isDateTimePickerVisible,
  mode = "date",
  onDatePicked,
  toggleDateTimePicker,
}: Props ) => {
  const [selectedDateNoTime, setSelectedDateNoTime] = React.useState<Date | undefined>( undefined );
  const [isTimeVisible, setisTimeVisible] = React.useState( false );

  const _toggleDateTimePicker = ( ) => {
    setisTimeVisible( false );
    toggleDateTimePicker( );
  };

  if ( mode === "datetime" && isTimeVisible ) {
    return (
      <DateTimePicker
        display="spinner"
        customHeaderIOS={EmptyHeader}
        isDarkModeEnabled={false}
        themeVariant="light"
        isVisible={isDateTimePickerVisible}
        maximumDate={new Date( )}
        mode="time"
        onCancel={_toggleDateTimePicker}
        onConfirm={selectedDate => {
          onDatePicked( selectedDate );
          _toggleDateTimePicker( );
        }}
        date={selectedDateNoTime}
      />
    );
  }

  if ( mode === "time" ) {
    return (
      <DateTimePicker
        display="spinner"
        customHeaderIOS={EmptyHeader}
        isDarkModeEnabled={false}
        themeVariant="light"
        isVisible={isDateTimePickerVisible}
        mode="time"
        onCancel={_toggleDateTimePicker}
        onConfirm={selectedDate => {
          onDatePicked( selectedDate );
          _toggleDateTimePicker( );
        }}
      />
    );
  }

  // Base case we want to pick a date
  return (
    <DateTimePicker
      display="spinner"
      customHeaderIOS={EmptyHeader}
      isDarkModeEnabled={false}
      themeVariant="light"
      isVisible={isDateTimePickerVisible}
      maximumDate={new Date( )}
      mode="date"
      onCancel={_toggleDateTimePicker}
      onConfirm={selectedDate => {
        if ( mode === "datetime" ) {
          setSelectedDateNoTime( selectedDateNoTime );
          setisTimeVisible( true );
        } else {
          onDatePicked( selectedDate );
          _toggleDateTimePicker( );
        }
      }}
      date={date || new Date( )}
    />
  );
};

export default DatePicker;
