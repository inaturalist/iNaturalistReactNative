// @flow

import { INatIcon } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";
import LinearGradient from "react-native-linear-gradient";
import { dropShadow } from "styles/global";
import colors from "styles/tailwindColors";

const GradientButton = ( {
  onPress,
  accessibilityHint,
  iconName,
  iconSize
}: {
  onPress: Function,
  accessibilityHint: string,
  iconName: string,
  iconSize: number
} ): React.Node => (
  <Pressable
    className="w-[69px] h-[69px] rounded-full overflow-hidden"
    testID="add-obs-button"
    style={dropShadow}
    onPress={onPress}
    disabled={false}
    accessibilityLabel={t( "Add-observations" )}
    accessibilityHint={accessibilityHint || t( "Opens-ar-camera" )}
    accessibilityRole="button"
    accessibilityState={{
      disabled: false
    }}
  >
    <LinearGradient
      colors={[colors.inatGreen, "#297F87"]}
      angle={156.95}
      useAngle
    >
      <View className="grow aspect-square flex items-center justify-center">
        <INatIcon
          name={iconName || "arcamera"}
          size={iconSize || 37}
          color={colors.white}
        />
      </View>
    </LinearGradient>
  </Pressable>
);

export default GradientButton;
