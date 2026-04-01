import classnames from "classnames";
import RotatableIconWrapper from "components/Camera/RotatableIconWrapper";
// eslint-disable-next-line max-len
import TransparentCircleButton from "components/SharedComponents/Buttons/TransparentCircleButton";
import React from "react";
import type { ViewStyle } from "react-native";
import type { TakePhotoOptions } from "react-native-vision-camera";
import { useTranslation } from "sharedHooks";

interface Props {
  rotatableAnimatedStyle: ViewStyle;
  toggleFlash: () => void;
  hasFlash?: boolean;
  takePhotoOptions: TakePhotoOptions;
  flashClassName?: string;
}

const Flash = ({
  rotatableAnimatedStyle,
  toggleFlash,
  hasFlash,
  takePhotoOptions,
  flashClassName,
}: Props) => {
  const { t } = useTranslation();

  if (!hasFlash) return null;
  let testID = "";
  let accessibilityHint = "";
  let name = "";
  switch (takePhotoOptions.flash) {
    case "on":
      name = "flash-on";
      testID = "flash-button-label-flash";
      accessibilityHint = t("Disable-flash");
      break;
    default: // default to off if no flash
      name = "flash-off";
      testID = "flash-button-label-flash-off";
      accessibilityHint = t("Enable-flash");
  }

  return (
    <RotatableIconWrapper
      rotatableAnimatedStyle={rotatableAnimatedStyle}
      containerClass={classnames("m-0", "border-0", flashClassName)}
    >
      <TransparentCircleButton
        onPress={toggleFlash}
        testID={testID}
        accessibilityLabel={t("Flash")}
        accessibilityHint={accessibilityHint}
        icon={name}
      />
    </RotatableIconWrapper>
  );
};

export default Flash;
