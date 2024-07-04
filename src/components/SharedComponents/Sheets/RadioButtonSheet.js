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
  selectedValue?: string,
  insideModal?: boolean
}

const RadioButtonSheet = ( {
  handleClose,
  confirm,
  headerText,
  radioValues,
  selectedValue = "none",
  insideModal
}: Props ): Node => {
  const { t } = useTranslation( );
  const [checked, setChecked] = useState( selectedValue );

  const radioButtonRow = radioRow => (
    <View className="pb-4">
      <RadioButtonRow
        key={radioRow}
        value={radioValues[radioRow].value}
        icon={radioValues[radioRow].icon}
        checked={checked === radioValues[radioRow].value}
        onPress={() => setChecked( radioValues[radioRow].value )}
        label={radioValues[radioRow].label}
        description={radioValues[radioRow].text}
      />
    </View>
  );

  return (
    <BottomSheet
      handleClose={handleClose}
      headerText={headerText}
      insideModal={insideModal}
    >
      <View className="p-4 pt-2">
        <View className="p-3">
          {Object.keys( radioValues ).map( radioRow => radioButtonRow( radioRow ) )}
        </View>
        <Button
          level="primary"
          onPress={( ) => confirm( checked )}
          text={radioValues[checked]?.buttonText ?? t( "CONFIRM" )}
          accessibilityLabel={radioValues[checked]?.buttonText ?? t( "CONFIRM" )}
        />
      </View>
    </BottomSheet>
  );
};

export default RadioButtonSheet;
