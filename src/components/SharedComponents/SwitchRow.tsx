import {
  Body1,
  Body2,
  INatIcon,
  List2,
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import type { GestureResponderEvent } from "react-native";
import { Switch } from "react-native-paper";
import colors from "styles/tailwindColors";

interface Props {
  value: boolean;
  classNames?: string;
  description?: string;
  icon?: string;
  label?: string;
  labelComponent?: React.JSX.Element;
  onValueChange: ( newValue: boolean ) => void;
  smallLabel?: boolean;
  testID?: string;
  disabled?: boolean;
}

const SwitchRow = ( {
  value,
  classNames,
  description,
  icon,
  label,
  labelComponent,
  onValueChange,
  smallLabel = false,
  testID,
  disabled = false,
}: Props ) => {
  const handlePress = ( _e: GestureResponderEvent ) => {
    if ( !disabled ) {
      onValueChange( !value );
    }
  };

  const Label = smallLabel
    ? Body2
    : Body1;

  return (
    <Pressable
      className={classNames}
      testID={testID}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      onPress={handlePress}
      disabled={disabled}
    >
      <View className="flex-row items-center">
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          color={colors.inatGreen}
          testID={`${testID || "Toggle"}.switch`}
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

export default SwitchRow;
