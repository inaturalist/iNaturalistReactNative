// @flow

import CheckBox from "@react-native-community/checkbox";
import {
  Body1, BottomSheet, BottomSheetStandardBackdrop, Button, List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  handleClose: Function,
  confirm: Function,
  snapPoints: Array<number>,
  headerText: string,
  radioValues: Object
}

const renderBackdrop = props => <BottomSheetStandardBackdrop props={props} />;

const RadioButtonSheet = ( {
  handleClose,
  confirm,
  snapPoints,
  headerText,
  radioValues
}: Props ): Node => {
  const { t } = useTranslation( );
  const [checkBoxValue, setCheckBoxValue] = useState( "none" );

  const radioButtonRow = radioRow => (
    <View className="flex-row mb-4" key={radioRow}>
      <CheckBox
        disabled={false}
        value={checkBoxValue === radioValues[radioRow].value}
        onValueChange={( ) => setCheckBoxValue( radioValues[radioRow].value )}
      />
      <View className="ml-3 flex-1">
        <Body1>{radioValues[radioRow].label}</Body1>
        <List2 className="flex-wrap">{radioValues[radioRow].text}</List2>
      </View>
    </View>
  );

  return (
    <BottomSheet
      backdropComponent={renderBackdrop}
      handleClose={handleClose}
      headerText={headerText}
      snapPoints={snapPoints}
      onChange={position => {
        if ( position === -1 ) {
          handleClose( );
        }
      }}
    >
      <View className="p-6">
        {Object.keys( radioValues ).map( radioRow => radioButtonRow( radioRow ) )}
        <Button
          level="primary"
          text={t( "CONFIRM" )}
          onPress={( ) => confirm( checkBoxValue )}
        />
      </View>
    </BottomSheet>
  );
};

export default RadioButtonSheet;
