// @flow

import { Body4 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import { useTranslation } from "react-i18next";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import useLocationName from "sharedHooks/useLocationName";

type Props = {
  latitude: number,
  longitude: number
};

const LocationDisplay = ( {
  latitude,
  longitude
}: Props ): React.Node => {
  const { t } = useTranslation( );
  const locationName = useLocationName( latitude, longitude );

  return (
    <View className="flex flex-row items-center">
      <IconMaterial name="location-pin" size={15} />
      <Body4 className="text-darkGray ml-[5px]">
        {locationName || t( "no place guess" )}
      </Body4>
    </View>
  );
};

export default LocationDisplay;
