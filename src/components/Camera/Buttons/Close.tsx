import RotatableIconWrapper from "components/Camera/RotatableIconWrapper";
import { TransparentCircleButton } from "components/SharedComponents";
import React from "react";
import type { ViewStyle } from "react-native";
import { useTranslation } from "sharedHooks";

interface Props {
  handleClose: () => void;
  rotatableAnimatedStyle?: ViewStyle;
}

const Close = ({ handleClose, rotatableAnimatedStyle }: Props) => {
  const { t } = useTranslation();

  return (
    <RotatableIconWrapper rotatableAnimatedStyle={rotatableAnimatedStyle}>
      <TransparentCircleButton
        onPress={handleClose}
        accessibilityLabel={t("Close")}
        accessibilityHint={t("Navigates-to-previous-screen")}
        icon="close"
      />
    </RotatableIconWrapper>
  );
};

export default Close;
