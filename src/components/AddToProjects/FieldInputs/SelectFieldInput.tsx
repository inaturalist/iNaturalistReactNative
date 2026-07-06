import { Body3, PickerSheet } from "components/SharedComponents";
import { Pressable } from "components/styledComponents";
import React, { useState } from "react";
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

  console.log( "setValue", setValue );

  return (
    <>
      {sheetOpen && (
        <PickerSheet
          headerText={obsField.name?.toLocaleUpperCase( ) || t( "Select-a-response" )}
          onPressClose={( ) => setSheetOpen( false )}
          confirm={( newValue: string ) => {
            setValue( newValue );
            setSheetOpen( false );
          }}
          selectedValue={value}
          pickerValues={obsField.allowedValues}
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
