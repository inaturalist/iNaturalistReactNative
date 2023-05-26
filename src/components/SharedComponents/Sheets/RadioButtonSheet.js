// @flow

import {
  Body1, BottomSheet, Button, List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { RadioButton } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  handleClose: Function,
  confirm: Function,
  snapPoints: Array<number>,
  headerText: string,
  radioValues: Object
}

const RadioButtonSheet = ( {
  handleClose,
  confirm,
  snapPoints,
  headerText,
  radioValues
}: Props ): Node => {
  const { t } = useTranslation( );
  const [checked, setChecked] = useState( "none" );

  const radioButtonRow = radioRow => (
    <View className="flex-row mb-4" key={radioRow}>
      {/* adding a View here makes the onPress ripple surround only
      the button and not use extra padding */}
      <View>
        <RadioButton.Android
          value={radioValues[radioRow]}
          status={( checked === radioValues[radioRow].value )
            ? "checked"
            : "unchecked"}
          onPress={( ) => setChecked( radioValues[radioRow].value )}
        />
      </View>
      <View className="ml-1 mt-2 flex-1">
        <Body1>{radioValues[radioRow].label}</Body1>
        <List2 className="flex-wrap">{radioValues[radioRow].text}</List2>
      </View>
    </View>
  );

  return (
    <BottomSheet
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
          onPress={( ) => confirm( checked )}
        />
      </View>
    </BottomSheet>
  );
};

export default RadioButtonSheet;
