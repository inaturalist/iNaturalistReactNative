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
  headerText: string,
  radioValues: Object,
  selectedValue?: any
}

type RowProps = {
  value: string,
  checked: boolean,
  onPress: Function,
  label: string,
  description: ?string
}

// TODO: this is proably better in a standalone component
export const RadioButtonRow = ( {
  value, checked, onPress, label, description
}: RowProps ): Node => {
  const theme = useTheme( );
  return (
    <RadioButton.Group>
      <RadioButton.Item
        value={value}
        status={checked
          ? "checked"
          : "unchecked"}
        onPress={onPress}
        mode="android"
        label={label}
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
        accessibilityLabel={label}
      />
      {description && <List2 className="ml-[37px] mr-[33px] py-1">{description}</List2>}
    </RadioButton.Group>
  );
};

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
      onChange={position => {
        if ( position === -1 ) {
          handleClose( );
        }
      }}
    >
      <View className="p-5">
        {Object.keys( radioValues ).map( radioRow => radioButtonRow( radioRow ) )}
        <Button
          level="primary"
          text={t( "CONFIRM" )}
          onPress={( ) => confirm( checked )}
          className="mt-[15px]"
          accessibilityLabel={t( "CONFIRM" )}
        />
      </View>
    </BottomSheet>
  );
};

export default RadioButtonSheet;
