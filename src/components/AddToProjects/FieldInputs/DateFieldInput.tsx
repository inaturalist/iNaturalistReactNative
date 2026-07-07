import { Body3, DateTimePicker } from "components/SharedComponents";
import { Pressable } from "components/styledComponents";
import React, { useMemo, useState } from "react";
import type { RealmObservationField } from "realmModels/types";
import { useTranslation } from "sharedHooks";

import useObservationFieldValue from "../hooks/useObservationFieldValue";

interface Props {
  obsField: RealmObservationField;
}

type DateFieldDatatype = "date" | "time" | "datetime";
const DateFieldInput = ( { obsField }: Props ) => {
  const { t } = useTranslation( );
  const { datatype, id } = obsField;
  const { value, setValue } = useObservationFieldValue( id );
  const [showPicker, setShowPicker] = useState( false );

  const displayValue = useMemo( () => {
    if ( !value ) return null;
    // TODO: format the Date value into human readable form
    // However, first check if we only send strings or date values time-zones etc
    return value.toISOString( );
  }, [value] );

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
        onDatePicked={newDate => setValue( newDate )}
        mode={datatype as DateFieldDatatype}
        toggleDateTimePicker={( ) => setShowPicker( false )}
      />
      <Pressable
        accessibilityRole="button"
        onPress={( ) => setShowPicker( true )}
      >
        <Body3 className={displayValue
          ? "pt-1"
          : "pt-1 color-darkGrayDisabled"}
        >
          {displayValue || placeholder}
        </Body3>
      </Pressable>
    </>
  );
};

export default DateFieldInput;
