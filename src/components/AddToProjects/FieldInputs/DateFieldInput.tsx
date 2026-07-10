import { Body3, DateTimePicker } from "components/SharedComponents";
import { Pressable } from "components/styledComponents";
import React, { useMemo, useState } from "react";
import type { RealmObservationField } from "realmModels/types";
import {
  formatObsFieldDate,
  formatObsFieldDatetime,
  formatObsFieldTime,
} from "sharedHelpers/dateAndTime";
import { useTranslation } from "sharedHooks";

import useObservationFieldValue from "../hooks/useObservationFieldValue";

interface Props {
  obsField: RealmObservationField;
}

type DateFieldDatatype = "date" | "time" | "datetime";

const formatPickedDate = (
  pickedDate: Date,
  datatype: DateFieldDatatype,
): string => {
  switch ( datatype ) {
    case "datetime":
      return formatObsFieldDatetime( pickedDate );
    case "date":
      return formatObsFieldDate( pickedDate );
    case "time":
      return formatObsFieldTime( pickedDate );
    default:
      throw new Error( "Unsupported datatype for DateFieldInput" );
  }
};

const DateFieldInput = ( { obsField }: Props ) => {
  const { t } = useTranslation( );
  const { datatype, id } = obsField;
  const { value, setValue } = useObservationFieldValue( id );
  const [showPicker, setShowPicker] = useState( false );

  const placeholder = useMemo( () => {
    switch ( datatype ) {
      case "date":
        return t( "Choose-a-date" );
      case "time":
        return t( "Choose-a-time" );
      case "datetime":
        return t( "Choose-a-date-time" );
      default:
        return "";
    }
  }, [datatype, t] );

  return (
    <>
      <DateTimePicker
        isDateTimePickerVisible={showPicker}
        onDatePicked={newDate => setValue(
          formatPickedDate( newDate, datatype as DateFieldDatatype ),
        )}
        mode={datatype as DateFieldDatatype}
        toggleDateTimePicker={( ) => setShowPicker( false )}
      />
      <Pressable
        accessibilityRole="button"
        onPress={( ) => setShowPicker( true )}
      >
        <Body3 className={value
          ? "pt-1"
          : "pt-1 color-darkGrayDisabled"}
        >
          {value || placeholder}
        </Body3>
      </Pressable>
    </>
  );
};

export default DateFieldInput;
