import classnames from "classnames";
import RotatableIconWrapper from "components/Camera/RotatableIconWrapper";
// eslint-disable-next-line max-len
import TransparentCircleButton from "components/SharedComponents/Buttons/TransparentCircleButton";
import React from "react";
import type { AnimatedStyle } from "react-native-reanimated";
import type { CapturePhotoSettings } from "react-native-vision-camera";
import { useTranslation } from "sharedHooks";

interface Props {
  rotatableAnimatedStyle: AnimatedStyle;
  toggleFlash: ( ) => void;
  hasFlash?: boolean;
  takePhotoOptions: CapturePhotoSettings;
  flashClassName?: string;
}

const Flash = ( {
  rotatableAnimatedStyle,
  toggleFlash,
  hasFlash,
  takePhotoOptions,
  flashClassName,
}: Props ) => {
  const { t } = useTranslation( );

  if ( !hasFlash ) return null;
  let testID = "";
  let accessibilityHint = "";
  let name = "";
  switch ( takePhotoOptions.flashMode ) {
    case "on":
      name = "flash-on";
      testID = "flash-button-label-flash";
      accessibilityHint = t( "Disable-flash" );
      break;
    default: // default to off if no flash
      name = "flash-off";
      testID = "flash-button-label-flash-off";
      accessibilityHint = t( "Enable-flash" );
  }

  return (
    <RotatableIconWrapper
      rotatableAnimatedStyle={rotatableAnimatedStyle}
      containerClass={classnames( "m-0", "border-0", flashClassName )}
    >
      <TransparentCircleButton
        onPress={toggleFlash}
        testID={testID}
        accessibilityLabel={t( "Flash" )}
        accessibilityHint={accessibilityHint}
        icon={name}
      />
    </RotatableIconWrapper>
  );
};

export default Flash;
