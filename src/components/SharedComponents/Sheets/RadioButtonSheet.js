// @flow

import {
  BottomSheet,
  Button,
  RadioButtonRow
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  handleClose: Function,
  confirm: Function,
  headerText: string,
  radioValues: Object,
  selectedValue?: any
}

const RadioButtonSheet = ( {
  handleClose,
  confirm,
  headerText,
  radioValues,
  selectedValue = "none"
}: Props ): Node => {
  const { t } = useTranslation( );
  const [checked, setChecked] = useState( selectedValue );

  const radioButtonRow = radioRow => (
    <RadioButtonRow
      key={radioRow}
      value={radioValues[radioRow]}
      checked={checked === radioValues[radioRow].value}
      onPress={() => setChecked( radioValues[radioRow].value )}
      label={radioValues[radioRow].label}
      description={radioValues[radioRow].text}
    />
  );

  return (
    <BottomSheet
      handleClose={handleClose}
      headerText={headerText}
    >
      <View className="p-5">
        {Object.keys( radioValues ).map( radioRow => radioButtonRow( radioRow ) )}
        <Button
          level="primary"
          onPress={( ) => confirm( checked )}
          text={radioValues[checked].buttonText ?? t( "CONFIRM" )}
          className="mt-[15px]"
          accessibilityLabel={radioValues[checked].buttonText ?? t( "CONFIRM" )}
        />
      </View>
    </BottomSheet>
  );
};

export default RadioButtonSheet;
