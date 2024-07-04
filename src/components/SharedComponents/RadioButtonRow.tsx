import {
  Body1,
  Body2,
  INatIcon,
  List2
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import { GestureResponderEvent } from "react-native";
import { RadioButton, useTheme } from "react-native-paper";

interface Props {
  testID?: string;
  icon?: string;
  label: string;
  smallLabel?: boolean;
  description?: string;
  onPress: ( _e: GestureResponderEvent ) => void;
  checked: boolean;
  value: string;
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
}: Props ) => {
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
