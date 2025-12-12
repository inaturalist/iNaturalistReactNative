import {
  BottomSheet,
  Button,
  RadioButtonRow
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useState } from "react";
import useTranslation from "sharedHooks/useTranslation";

interface Props {
  bottomComponent?: React.JSX.Element;
  buttonRowClassName?: string;
  confirm: ( _checkedValue: string ) => void;
  confirmText?: string;
  headerText: string;
  insideModal?: boolean;
  onPressClose?: ( ) => void;
  radioValues: Record<string, {
    value: string;
    icon?: string;
    label: string;
    text?: string;
    buttonText?: string;
  }>;
  selectedValue?: string;
  testID?: string;
  topDescriptionText?: React.JSX.Element;
}

const RadioButtonSheet = ( {
  bottomComponent,
  buttonRowClassName,
  confirm,
  confirmText,
  headerText,
  insideModal,
  onPressClose,
  radioValues,
  selectedValue = "none",
  testID,
  topDescriptionText
}: Props ) => {
  const { t } = useTranslation( );
  const [checkedValue, setCheckedValue] = useState( selectedValue );

  const radioButtonRow = ( radioRow: string ) => (
    <View key={radioRow} className="pb-4">
      <RadioButtonRow
        classNames={buttonRowClassName}
        value={radioValues[radioRow].value}
        icon={radioValues[radioRow].icon}
        checked={checkedValue === radioValues[radioRow].value}
        onPress={() => setCheckedValue( radioValues[radioRow].value )}
        label={radioValues[radioRow].label}
        description={radioValues[radioRow].text}
        labelComponent={radioValues[radioRow].labelComponent}
      />
    </View>
  );

  const confirmLabel = confirmText || t( "CONFIRM" );

  return (
    <BottomSheet
      headerText={headerText}
      insideModal={insideModal}
      onPressClose={onPressClose}
      testID={testID}
    >
      <View className="p-4 pt-2">
        {topDescriptionText}
        <View className="p-3">
          {Object.keys( radioValues ).map( radioRow => radioButtonRow( radioRow ) )}
        </View>
        {bottomComponent}
        <Button
          level="primary"
          onPress={( ) => {
            confirm( checkedValue );
          }}
          text={radioValues[checkedValue]?.buttonText ?? confirmLabel}
          accessibilityLabel={radioValues[checkedValue]?.buttonText ?? confirmLabel}
        />
      </View>
    </BottomSheet>
  );
};

export default RadioButtonSheet;
