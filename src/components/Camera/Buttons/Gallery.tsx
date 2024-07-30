import { useNavigation } from "@react-navigation/native";
import { TransparentCircleButton } from "components/SharedComponents";
import React from "react";
import { ViewStyle } from "react-native";
import DeviceInfo from "react-native-device-info";
import Animated from "react-native-reanimated";
import { useTranslation } from "sharedHooks";

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
      <TransparentCircleButton
        onPress={( ) => navigation.push( "PhotoGallery", { cmonBack: true } )}
        accessibilityLabel={t( "Photo-importer" )}
        accessibilityHint={t( "Navigates-to-photo-importer" )}
        icon="gallery"
      />
    </Animated.View>
  );
};

export default Gallery;
