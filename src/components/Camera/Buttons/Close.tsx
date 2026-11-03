import RotatableIconWrapper from "components/Camera/RotatableIconWrapper";
import { TransparentCircleButton } from "components/SharedComponents";
import React from "react";
import type { AnimatedStyle } from "react-native-reanimated";
import { useTranslation } from "sharedHooks";

interface Props {
  handleClose: ( ) => void;
  rotatableAnimatedStyle?: AnimatedStyle;
}

const Close = ( { handleClose, rotatableAnimatedStyle }: Props ) => {
  const { t } = useTranslation( );

  return (
    <RotatableIconWrapper rotatableAnimatedStyle={rotatableAnimatedStyle}>
      <TransparentCircleButton
        onPress={handleClose}
        accessibilityLabel={t( "Close" )}
        accessibilityHint={t( "Navigates-to-previous-screen" )}
        icon="close"
      />
    </RotatableIconWrapper>
  );
};

export default Close;
