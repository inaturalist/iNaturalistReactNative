import { TransparentCircleButton } from "components/SharedComponents";
import React from "react";
import type {
  GestureResponderEvent,
  ViewStyle,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import Animated from "react-native-reanimated";
import { useTranslation } from "sharedHooks";

interface Props {
  flipCamera: ( _event: GestureResponderEvent ) => void;
  cameraFlipClasses?: string;
  rotatableAnimatedStyle?: ViewStyle;
}

const isTablet = DeviceInfo.isTablet();

const CameraFlip = ( {
  flipCamera,
  cameraFlipClasses,
  rotatableAnimatedStyle,
}: Props ) => {
  const { t } = useTranslation( );

  return (
    <Animated.View style={!isTablet && rotatableAnimatedStyle}>
      <TransparentCircleButton
        optionalClasses={cameraFlipClasses}
        onPress={flipCamera}
        accessibilityLabel={t( "Flip-camera" )}
        accessibilityHint={t( "Use-the-devices-other-camera" )}
        icon="rotate"
      />
    </Animated.View>
  );
};

export default CameraFlip;
