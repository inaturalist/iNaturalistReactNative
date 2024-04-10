// @flow
import {
  Body1,
  INatIcon,
  List2
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { RadioButton, useTheme } from "react-native-paper";

type Props = {
  checked: boolean,
  description: ?string,
  icon: string,
  label: string,
  onPress: Function,
  value: string,
}

const RadioButtonRow = ( {
  description,
  checked,
  label,
  onPress,
  icon,
  value
}: Props ): Node => {
  const theme = useTheme( );

  const status = checked
    ? "checked"
    : "unchecked";

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <View className="flex-row items-center">
        <RadioButton.Android
          onPress={onPress}
          value={value}
          status={status}
          accessibilityLabel={label}
        />
        <View className="flex-row">
          <Body1 className="mr-2">{label}</Body1>
          {icon && <INatIcon name={icon} size={19} color={theme.colors.secondary} />}
        </View>
      </View>
      {description && (
        <List2 className="ml-[37px] mr-[33px] py-1">{description}</List2>
      )}
    </Pressable>
  );
};

export default RadioButtonRow;
