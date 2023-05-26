// @flow

import {
  BottomSheet, Button, List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { Platform } from "react-native";
import { RadioButton, useTheme } from "react-native-paper";
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
  const theme = useTheme( );
  const { t } = useTranslation( );
  const [checked, setChecked] = useState( "none" );

  const radioButtonRow = radioRow => (
    <RadioButton.Group>
      <RadioButton.Item
        value={radioValues[radioRow]}
        status={( checked === radioValues[radioRow].value )
          ? "checked"
          : "unchecked"}
        onPress={( ) => setChecked( radioValues[radioRow].value )}
        mode="android"
        label={radioValues[radioRow].label}
        position="leading"
        // eslint-disable-next-line react-native/no-inline-styles
        labelStyle={{
          fontSize: 18,
          lineHeight: 22,
          fontFamily: `Whitney-Light${Platform.OS === "ios"
            ? ""
            : "-Pro"}`,
          color: theme.colors.primary,
          fontWeight: "500",
          textAlign: "left",
          textAlignVertical: "center"
        }}
        className="p-0"
      />
      <List2 className="ml-[37px] mr-[33px] py-1">{radioValues[radioRow].text}</List2>
    </RadioButton.Group>
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
      <View className="px-4 pt-[20px]">
        {Object.keys( radioValues ).map( radioRow => radioButtonRow( radioRow ) )}
        <Button
          level="primary"
          text={t( "CONFIRM" )}
          onPress={( ) => confirm( checked )}
          className="mt-[15px]"
        />
      </View>
    </BottomSheet>
  );
};

export default RadioButtonSheet;
