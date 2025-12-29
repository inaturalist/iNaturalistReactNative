import { INatIcon } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";
import type { GestureResponderEvent } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { dropShadow } from "styles/global";
import colors from "styles/tailwindColors";

interface Props {
  sizeClassName: string;
  onLongPress?: ( _event: GestureResponderEvent ) => void;
  onPress: ( _event: GestureResponderEvent ) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  iconName?: string;
  iconSize?: number;
}
const GradientButton = ( {
  sizeClassName,
  onLongPress,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  iconName,
  iconSize,
}: Props ) => {
  const handleLongPress = ( event: GestureResponderEvent ) => {
    if ( onLongPress ) {
      onLongPress( event );
    }
  };

  return (
    <Pressable
      className={`${sizeClassName} rounded-full overflow-hidden`}
      testID="add-obs-button"
      style={dropShadow}
      onLongPress={handleLongPress}
      onPress={onPress}
      disabled={false}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint || t( "Opens-AI-camera" )}
      accessibilityRole="button"
      accessibilityState={{
        disabled: false,
      }}
    >
      <LinearGradient
        colors={[colors.inatGreen, "#297F87"]}
        angle={156.95}
        useAngle
      >
        <View className="grow aspect-square flex items-center justify-center">
          <INatIcon
            name={iconName || "aicamera"}
            size={iconSize || 47}
            color={colors.white}
          />
        </View>
      </LinearGradient>
    </Pressable>
  );
};

export default GradientButton;
