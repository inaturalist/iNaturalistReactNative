import { Body2 } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import type { GestureResponderEvent } from "react-native";
import { Switch } from "react-native-paper";
import colors from "styles/tailwindColors";

interface Props {
  classNames: string;
  label: string;
  onValueChange: ( newValue: boolean ) => void;
  testID: string;
  value: boolean;
  disabled?: boolean;
}

const SwitchRow = ( {
  classNames,
  label,
  onValueChange,
  testID,
  value,
  disabled = false,
}: Props ) => {
  const handlePress = ( _e: GestureResponderEvent ) => {
    if ( !disabled ) {
      onValueChange( !value );
    }
  };

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
          <Body2
            maxFontSizeMultiplier={1.5}
          >
            {label}
          </Body2>
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
