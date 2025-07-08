import {
  Button
} from "components/SharedComponents";
import { ImageBackground } from "components/styledComponents";
import LocationIndicatorIcon from "images/svg/location_indicator.svg";
import React from "react";
import { View } from "react-native";
import { useTranslation } from "sharedHooks";

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
        className="w-full h-[230px] flex justify-center"
        source={require( "images/topographic-map.png" )}
        accessibilityIgnoresInvertColors
      >
        <View
          className="w-full items-center"
        >
          <LocationIndicatorIcon
            testID="Map.LocationIndicator"
            width={40}
            height={40}
          />
        </View>

        <Button
          className="mt-5 pl-6 pr-6 border-0"
          level="neutral"
          text={t( "ADD-LOCATION-FOR-BETTER-IDS" )}
          onPress={handleAddLocationPressed}
          accessibilityLabel={t( "Edit-location" )}
          accessibilityHint={t( "Add-location-to-refresh-suggestions" )}
        />
      </ImageBackground>
    </View>
  );
};

export default EmptyMapSection;
