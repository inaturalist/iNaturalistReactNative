import {
  BottomSheet,
  Button,
  RadioButtonRow
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useState } from "react";
import useTranslation from "sharedHooks/useTranslation";

interface Props {
  handleClose: Function,
  confirm: ( _checkedValue: string ) => void;
  headerText: string,
  radioValues: {
    [key: string]: {
      value: string,
      icon?: string,
      label: string,
      text?: string,
      buttonText?: string,
    }
  },
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
}: Props ) => {
  const { t } = useTranslation( );
  const [checkedValue, setCheckedValue] = useState( selectedValue );

  const radioButtonRow = ( radioRow: string ) => (
    <View key={radioRow} className="pb-4">
      <RadioButtonRow
        value={radioValues[radioRow].value}
        icon={radioValues[radioRow].icon}
        checked={checkedValue === radioValues[radioRow].value}
        onPress={() => setCheckedValue( radioValues[radioRow].value )}
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
          onPress={( ) => confirm( checkedValue )}
          text={radioValues[checkedValue]?.buttonText ?? t( "CONFIRM" )}
          accessibilityLabel={radioValues[checkedValue]?.buttonText ?? t( "CONFIRM" )}
        />
      </View>
    </BottomSheet>
  );
};

export default RadioButtonSheet;
