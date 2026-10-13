import classNames from "classnames";
import RotatableIconWrapper from "components/Camera/RotatableIconWrapper";
import { TransparentCircleButton } from "components/SharedComponents";
import React from "react";
import type { AnimatedStyle } from "react-native-reanimated";
import { useTranslation } from "sharedHooks";

interface Props {
  flipCamera: ( ) => void;
  cameraFlipClassName?: string;
  rotatableAnimatedStyle?: AnimatedStyle;
}

const CameraFlip = ( {
  flipCamera,
  cameraFlipClassName,
  rotatableAnimatedStyle,
}: Props ) => {
  const { t } = useTranslation( );

  return (
    <RotatableIconWrapper
      rotatableAnimatedStyle={rotatableAnimatedStyle}
      containerClass={classNames( cameraFlipClassName )}
    >
      <TransparentCircleButton
        onPress={flipCamera}
        accessibilityLabel={t( "Flip-camera" )}
        accessibilityHint={t( "Use-the-devices-other-camera" )}
        icon="rotate"
      />
    </RotatableIconWrapper>
  );
};

export default CameraFlip;
