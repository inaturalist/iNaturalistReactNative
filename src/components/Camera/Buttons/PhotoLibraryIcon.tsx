import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import RotatableIconWrapper from "components/Camera/RotatableIconWrapper";
import { INatIconButton } from "components/SharedComponents";
import React from "react";
import type { ViewStyle } from "react-native";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  rotatableAnimatedStyle: ViewStyle;
  deleteSentinelFile: () => Promise<void>;
  disabled?: boolean;
}

const PhotoLibraryIcon = ({
  rotatableAnimatedStyle,
  deleteSentinelFile,
  disabled,
}: Props) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <RotatableIconWrapper
      rotatableAnimatedStyle={rotatableAnimatedStyle}
      containerClass="m-0 border-0"
    >
      <INatIconButton
        className={classnames(
          "bg-black/50",
          "items-center",
          "justify-center",
          "border-white",
          "border-2",
          "rounded",
        )}
        onPress={() => {
          deleteSentinelFile();
          navigation.push("PhotoLibrary", {
            cmonBack: true,
            lastScreen: "Camera",
            fromAICamera: true,
          });
        }}
        accessibilityLabel={t("Photo-importer")}
        accessibilityHint={t("Navigates-to-photo-importer")}
        icon="photo-library"
        color={(colors?.white as string) || "white"}
        size={26}
        width={62}
        height={62}
        disabled={disabled}
      />
    </RotatableIconWrapper>
  );
};

export default PhotoLibraryIcon;
