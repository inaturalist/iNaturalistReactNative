import {
  Body1,
  Body2,
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import type { GestureResponderEvent } from "react-native";
import { Switch } from "react-native-paper";
import colors from "styles/tailwindColors";

interface Props {
  classNames: string;
  label: string;
  onValueChange: ( newValue: boolean ) => void;
  smallLabel: boolean;
  testID: string;
  value: boolean;
  labelComponent?: React.JSX.Element;
  disabled?: boolean;
}

const SwitchRow = ( {
  classNames,
  label,
  onValueChange,
  smallLabel = false,
  testID,
  value,
  labelComponent,
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
        <View className="mr-3 flex-row flex-1">
          {labelComponent || (
            <Label
              maxFontSizeMultiplier={1.5}
              className="mr-2"
            >
              {label}
            </Label>
          )}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          color={colors.inatGreen}
          testID={`${testID || "Toggle"}.switch`}
        />
      </View>
    </Pressable>
  );
};

export default SwitchRow;
