import {
  INatIcon,
  Subheading1
} from "components/SharedComponents";
import { ImageBackground, Pressable } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  handleLocationPickerPressed: ( ) => void
}

const EmptyMapSection = ( {
  handleLocationPickerPressed
}: Props ) => {
  const { t } = useTranslation( );
  return (
    <Pressable
      accessibilityLabel={t( "Edit-location" )}
      accessibilityRole="link"
      onPress={handleLocationPickerPressed}
    >
      <ImageBackground
        className="w-full h-[230px] flex items-center justify-center"
        source={require( "images/topographic-map.png" )}
        accessibilityIgnoresInvertColors
      >
        <INatIcon name="location" size={40} color={colors.white} />
        <Subheading1 className="mt-3 text-white px-28 text-center">
          {t( "Add-location-for-better-identifications" )}
        </Subheading1>
      </ImageBackground>
    </Pressable>
  );
};

export default EmptyMapSection;
