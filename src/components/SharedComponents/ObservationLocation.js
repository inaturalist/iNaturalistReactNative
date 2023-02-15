// @flow
import classnames from "classnames";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
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

  let displayLocation = checkCamelAndSnakeCase( observation, "placeGuess" );
  if ( !displayLocation && observation.latitude ) {
    displayLocation = `${observation.latitude}, ${observation.longitude}`;
  }
  if ( !displayLocation ) {
    displayLocation = t( "Missing-Location" );
  }

  return (
    <View className={classnames( "flex flex-row items-center", margin )}>
      <IconMaterial name="location-pin" size={15} />
      <Body4 className="text-darkGray ml-[5px]">{displayLocation}</Body4>
    </View>
  );
};

export default ObservationLocation;
