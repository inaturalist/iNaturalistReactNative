// @flow

import { TransparentCircleButton } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  flipCamera: ( ) => void,
  cameraFlipClasses?: string
}

const CameraFlip = ( {
  flipCamera,
  cameraFlipClasses
}: Props ): Node => {
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
