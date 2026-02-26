import { TransparentCircleButton } from "components/SharedComponents";
import React from "react";
import type { ViewStyle } from "react-native";
import DeviceInfo from "react-native-device-info";
import Animated from "react-native-reanimated";
import { useTranslation } from "sharedHooks";

interface Props {
  handleClose: ( ) => void;
  rotatableAnimatedStyle?: ViewStyle;
}

const isTablet = DeviceInfo.isTablet();

const Close = ( { handleClose, rotatableAnimatedStyle }: Props ) => {
  const { t } = useTranslation( );

  return (
    <Animated.View style={!isTablet && rotatableAnimatedStyle}>
      <TransparentCircleButton
        onPress={handleClose}
        accessibilityLabel={t( "Close" )}
        accessibilityHint={t( "Navigates-to-previous-screen" )}
        icon="close"
      />
    </Animated.View>
  );
};

export default Close;
