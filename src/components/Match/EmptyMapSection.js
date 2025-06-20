import {
  Heading4,
  INatIcon
} from "components/SharedComponents";
import { ImageBackground, Pressable } from "components/styledComponents";
import React from "react";
import { View } from "react-native";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  handleAddLocationPressed: ( ) => void
}

const EmptyMapSection = ( {
  handleAddLocationPressed
}: Props ) => {
  const { t } = useTranslation( );
  return (
    <View>
      <ImageBackground
        className="w-full h-[230px] flex items-center justify-center"
        source={require( "images/topographic-map.png" )}
        accessibilityIgnoresInvertColors
      >
        <INatIcon name="map-marker-outline" size={40} color={colors.white} />

        <Pressable
          className="mt-3 px-14 py-4 rounded-lg bg-white ml-2 mr-2 active:opacity-75"
          accessibilityLabel={t( "ADD-LOCATION-FOR-BETTER-IDS" )}
          accessibilityRole="link"
          onPress={handleAddLocationPressed}
        >
          <Heading4 className="text-darkGray text-center">
            {t( "ADD-LOCATION-FOR-BETTER-IDS" )}
          </Heading4>
        </Pressable>
      </ImageBackground>
    </View>
  );
};

export default EmptyMapSection;
