import {
  Body1,
  Body2,
  INatIcon,
  List2,
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import type { GestureResponderEvent } from "react-native";
import { RadioButton } from "react-native-paper";
import colors from "styles/tailwindColors";

interface Props {
  checked: boolean;
  classNames?: string;
  description?: string;
  icon?: string;
  label?: string;
  labelComponent?: React.JSX.Element;
  onPress: ( _e: GestureResponderEvent ) => void;
  smallLabel?: boolean;
  testID?: string;
  value: string;
}

const RadioButtonRow = ( {
  checked,
  classNames,
  description,
  icon,
  label,
  labelComponent,
  onPress,
  smallLabel = false,
  testID,
  value,
}: Props ) => {
  const status = checked
    ? "checked"
    : "unchecked";

  const Label = smallLabel
    ? Body2
    : Body1;

  return (
    <Pressable className={classNames} testID={testID} accessibilityRole="button" onPress={onPress}>
      <View className="flex-row items-center">
        <RadioButton.Android
          onPress={onPress}
          value={value}
          status={status}
          accessibilityLabel={label}
          color={colors.darkGray}
        />
        <View className="ml-3 flex-row w-5/6">
          {labelComponent || (
            <Label
              maxFontSizeMultiplier={1.5}
              className="mr-2"
            >
              {label}
            </Label>
          )}
          {icon && <INatIcon name={icon} size={19} color={colors.inatGreen} />}
        </View>
      </View>
      {description && (
        <List2
          maxFontSizeMultiplier={1.5}
          className="ml-[32px] mt-[3px]"
        >
          {description}
        </List2>
      )}
    </Pressable>
  );
};

export default RadioButtonRow;
