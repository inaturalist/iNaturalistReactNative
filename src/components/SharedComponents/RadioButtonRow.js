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
      {/* RadioButton.Android has a built-in margin of 8, so we have to add a padding
      of 4 to the left of the text container to match the design of distance of 12 between
      button and text. Similarly we have to add a margin of 8 only to top in order to get
      to the wanted 16. */}
      <View className="mt-2 flex-row items-top">
        {/* Essentially this element has m-2 built-in */}
        <RadioButton.Android
          onPress={onPress}
          value={value}
          status={status}
          accessibilityLabel={label}
        />
        <View className="ml-1 mt-2 mr-[33px]">
          <View className="flex-row">
            <Label className="mr-[10px]">{label}</Label>
            {icon && <INatIcon name={icon} size={19} color={theme.colors.secondary} />}
          </View>
          {description && (
            <List2 className="mt-1">{description}</List2>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default RadioButtonRow;
