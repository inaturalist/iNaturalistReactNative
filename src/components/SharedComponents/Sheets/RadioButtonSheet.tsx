import {
  BottomSheet,
  Button,
  RadioButtonRow,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useState } from "react";
import useTranslation from "sharedHooks/useTranslation";

type RadioSheetPrimitive = boolean | number | string;

export interface RadioSheetOption<ValueT extends RadioSheetPrimitive> {
  buttonText?: string;
  icon?: string;
  label?: string;
  labelComponent?: React.JSX.Element;
  text?: string;
  value: ValueT;
}

interface Props<ValueT extends RadioSheetPrimitive> {
  bottomComponent?: React.JSX.Element;
  buttonRowClassName?: string;
  confirm: ( _checkedValue: ValueT ) => void;
  confirmText?: string;
  headerText: string;
  insideModal?: boolean;
  loading?: boolean;
  onPressClose?: ( ) => void;
  requireSelectionChange?: boolean;
  radioValues: Record<string, RadioSheetOption<ValueT>>;
  selectedValue: ValueT;
  testID?: string;
  topDescriptionText?: React.JSX.Element;
}

const RadioButtonSheet = <ValueT extends RadioSheetPrimitive>( {
  bottomComponent,
  buttonRowClassName,
  confirm,
  confirmText,
  headerText,
  insideModal,
  loading,
  onPressClose,
  radioValues,
  requireSelectionChange = true,
  selectedValue,
  testID,
  topDescriptionText,
}: Props<ValueT> ) => {
  const { t } = useTranslation( );
  const [checkedValue, setCheckedValue] = useState( selectedValue );

  const isDirty = checkedValue !== selectedValue;
  const confirmBlockedByDirtyCheck = requireSelectionChange && !isDirty;

  const radioButtonRow = ( radioRow: string ) => (
    <View key={radioRow} className="pb-4">
      <RadioButtonRow
        classNames={buttonRowClassName}
        value={radioValues[radioRow].value.toString( )}
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
  const buttonLabel = radioValues[String( checkedValue )]?.buttonText ?? confirmLabel;

  return (
    <BottomSheet
      headerText={headerText}
      insideModal={insideModal}
      onPressClose={onPressClose}
      testID={testID}
      scrollEnabled={false}
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
          disabled={confirmBlockedByDirtyCheck || loading}
          loading={loading}
          text={buttonLabel}
          accessibilityLabel={buttonLabel}
        />
      </View>
    </BottomSheet>
  );
};

export default RadioButtonSheet;
