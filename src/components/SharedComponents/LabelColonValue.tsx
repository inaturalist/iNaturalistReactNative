import {
  Body4
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";

type Props = {
  label: string;
  LabelComponent?: Function;
  valueSelectable?: boolean;
  value: string | number;
  ValueComponent?: Function;
}

const LabelColonValue = ( {
  label,
  LabelComponent = Body4,
  valueSelectable,
  value,
  ValueComponent = Body4
}: Props ) => (
  <View className="flex-row justify-start">
    <View className="flex-row">
      <LabelComponent>{ label }</LabelComponent>
      <LabelComponent>:</LabelComponent>
    </View>
    <ValueComponent selectable={valueSelectable} className="ml-1">{ value }</ValueComponent>
  </View>
);

export default LabelColonValue;
