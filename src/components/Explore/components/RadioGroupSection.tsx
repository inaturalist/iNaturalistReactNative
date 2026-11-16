import {
  Heading4,
  RadioButtonRow,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";

type RadioValue = boolean | number | string;

interface Props<ValueT extends RadioValue> {
  headerText: string;
  onChange: ( value: ValueT ) => void;
  selectedValue: ValueT;
  values: Record<string, { label: string; value: ValueT }>;
}

const RadioGroupSection = <ValueT extends RadioValue>( {
  headerText,
  onChange,
  selectedValue,
  values,
}: Props<ValueT> ) => {
  const rows = Object.keys( values ).map( key => (
    <View key={key} className="mb-4">
      <RadioButtonRow
        smallLabel
        value={values[key].value.toString( )}
        checked={values[key].value === selectedValue}
        onPress={( ) => onChange( values[key].value )}
        label={values[key].label}
      />
    </View>
  ) );

  return (
    <View className="mb-3">
      <Heading4 className="mb-5">{headerText}</Heading4>
      {rows}
    </View>
  );
};

export default RadioGroupSection;
