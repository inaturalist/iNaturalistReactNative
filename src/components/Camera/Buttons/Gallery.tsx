import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import { INatIconButton } from "components/SharedComponents";
import React from "react";
import { ViewStyle } from "react-native";
import DeviceInfo from "react-native-device-info";
import Animated from "react-native-reanimated";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  rotatableAnimatedStyle: ViewStyle;
}

const isTablet = DeviceInfo.isTablet();

const Gallery = ( { rotatableAnimatedStyle }: Props ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );

  return (
    <Animated.View
      style={!isTablet && rotatableAnimatedStyle}
      className="m-0 border-0"
    >
      <INatIconButton
        className={classnames(
          "bg-black/50",
          "items-center",
          "justify-center",
          "border-white",
          "border-2",
          "rounded"
        )}
        onPress={( ) => navigation.push( "PhotoGallery", {
          cmonBack: true,
          lastScreen: "Camera"
        } )}
        accessibilityLabel={t( "Photo-importer" )}
        accessibilityHint={t( "Navigates-to-photo-importer" )}
        icon="gallery"
        color={( colors?.white as string ) || "white"}
        size={26}
        width={62}
        height={62}
      />
    </Animated.View>
  );
};

export default Gallery;
