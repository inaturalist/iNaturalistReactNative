import { Body3, PickerSheet } from "components/SharedComponents";
import { Pressable } from "components/styledComponents";
import React, { useMemo, useState } from "react";
import type { RealmObservationField } from "realmModels/types";
import { useTranslation } from "sharedHooks";

import useObservationFieldValue from "../hooks/useObservationFieldValue";

interface Props {
  obsField: RealmObservationField;
}

const SelectFieldInput = ( { obsField }: Props ) => {
  const { t } = useTranslation( );
  const { id } = obsField;
  const { value, setValue } = useObservationFieldValue( id );
  const [sheetOpen, setSheetOpen] = useState( false );

  const pickerValues = useMemo( () => {
    const values: Record<string, { label: string; value: string }> = {};
    obsField.allowedValues.forEach( allowedValue => {
      values[String( allowedValue )] = {
        label: allowedValue,
        value: allowedValue,
      };
    } );
    return values;
  }, [obsField.allowedValues] );

  return (
    <>
      {sheetOpen && (
        <PickerSheet
          headerText={obsField.name?.toLocaleUpperCase( ) || t( "Select-a-response" )}
          onPressClose={( ) => setSheetOpen( false )}
          confirm={newValue => {
            setValue( newValue );
            setSheetOpen( false );
          }}
          selectedValue={value}
          pickerValues={pickerValues}
        />
      )}
      <Pressable accessibilityRole="button" onPress={() => setSheetOpen( true )}>
        <Body3 className={value
          ? "pt-1"
          : "pt-1 color-darkGrayDisabled"}
        >
          {value || t( "Select-a-response" )}
        </Body3>
      </Pressable>
    </>
  );
};

export default SelectFieldInput;
