import { Body3 } from "components/SharedComponents";
import { Pressable } from "components/styledComponents";
import React, { useMemo, useState } from "react";
import type { RealmObservationField } from "realmModels/types";
import { useTranslation } from "sharedHooks";

import useObservationFieldValue from "../hooks/useObservationFieldValue";

interface Props {
  obsField: RealmObservationField;
}

const DateFieldInput = ( { obsField }: Props ) => {
  const { t } = useTranslation( );
  const { datatype, id } = obsField;
  const { value, setValue } = useObservationFieldValue( id );
  console.log( setValue );
  const [showPicker, setShowPicker] = useState( false );
  console.log( "showPicker", showPicker );
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
  );
};

export default DateFieldInput;
