import { TransparentCircleButton } from "components/SharedComponents";
import React from "react";
import type { GestureResponderEvent } from "react-native";
import { useTranslation } from "sharedHooks";

interface Props {
  flipCamera: ( _event: GestureResponderEvent ) => void;
  cameraFlipClasses?: string;
}

const CameraFlip = ( {
  flipCamera,
  cameraFlipClasses
}: Props ) => {
  const { t } = useTranslation( );

  return (
    <TransparentCircleButton
      optionalClasses={cameraFlipClasses}
      onPress={flipCamera}
      accessibilityLabel={t( "Flip-camera" )}
      accessibilityHint={t( "Use-the-devices-other-camera" )}
      icon="rotate"
    />
  );
};

export default CameraFlip;
