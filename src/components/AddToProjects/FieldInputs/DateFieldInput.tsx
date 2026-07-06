import { Body3 } from "components/SharedComponents";
import React, { useMemo } from "react";
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
    <Body3 className={value
      ? "pt-1"
      : "pt-1 color-darkGrayDisabled"}
    >
      {value || placeholder}
    </Body3>
  );
};

export default DateFieldInput;
