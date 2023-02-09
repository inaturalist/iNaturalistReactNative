// @flow

import { Body4 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import { useTranslation } from "react-i18next";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

type Props = {
  observation: Object
};

const ObservationLocation = ( { observation }: Props ): React.Node => {
  const { t } = useTranslation();

  let locationName = observation?.place_guess;

  if (
    !locationName
    // Check for undefined or null, Not 0
    && observation?.latitude != null
    && observation?.longitude != null
  ) {
    locationName = `${observation.latitude}, ${observation.longitude}`;
  } else if ( !locationName ) {
    locationName = t( "Missing Location" );
  }

  return (
    <View className="flex flex-row items-center mt-1">
      <IconMaterial name="location-pin" size={15} />
      <Body4 className="text-darkGray ml-[5px]">
        {locationName || t( "Missing-Location" )}
      </Body4>
    </View>
  );
};

export default ObservationLocation;
