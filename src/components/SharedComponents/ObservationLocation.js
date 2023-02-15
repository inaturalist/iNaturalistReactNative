// @flow
import classnames from "classnames";
import { Body4 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import { useTranslation } from "react-i18next";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

type Props = {
  observation: Object,
  margin?: string
};

const ObservationLocation = ( { observation, margin }: Props ): React.Node => {
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
    locationName = t( "Missing-Location" );
  }

  return (
    <View className={classnames( "flex flex-row items-center", margin )}>
      <IconMaterial name="location-pin" size={15} />
      <Body4 className="text-darkGray ml-[5px]">
        {locationName}
      </Body4>
    </View>
  );
};

export default ObservationLocation;
