// @flow
import {
  Body1,
  Body2,
  INatIcon,
  List2
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { RadioButton, useTheme } from "react-native-paper";

type Props = {
  testID: string,
  checked: boolean,
  description: ?string,
  icon: string,
  label: string,
  onPress: Function,
  value: string,
  smallLabel: ?boolean
}

const RadioButtonRow = ( {
  testID,
  description,
  checked,
  label,
  onPress,
  icon,
  value,
  smallLabel = false
}: Props ): Node => {
  const theme = useTheme( );

  const status = checked
    ? "checked"
    : "unchecked";

  const Label = smallLabel
    ? Body2
    : Body1;

  return (
    <Pressable testID={testID} accessibilityRole="button" onPress={onPress}>
      <View className="flex-row items-center">
        <RadioButton.Android
          onPress={onPress}
          value={value}
          status={status}
          accessibilityLabel={label}
        />
        <View className="ml-3 flex-row">
          <Label className="mr-[10px]">{label}</Label>
          {icon && <INatIcon name={icon} size={19} color={theme.colors.secondary} />}
        </View>
      </View>
      {description && (
        <List2 className="ml-[32px] mt-[3px]">{description}</List2>
      )}
    </Pressable>
  );
};

export default RadioButtonRow;
