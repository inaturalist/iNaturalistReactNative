// @flow

import {
  Body4,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( );

type Props = {
  region: Object,
  accuracy: number
};

const DisplayLatLng = ( { region, accuracy }: Props ): Node => {
  const { t } = useTranslation( );
  let displayLocation = "";
  if ( region.latitude && region.longitude ) {
    if ( accuracy ) {
      displayLocation = t( "Lat-Lon-Acc", {
        latitude: region.latitude,
        longitude: region.longitude,
        accuracy,
      } );
    } else {
      displayLocation = t( "Lat-Lon", {
        latitude: region.latitude,
        longitude: region.longitude,
      } );
    }
  }

  return (
    <View
      className="bg-white h-[27px] rounded-lg absolute top-[85px] right-[26px] left-[26px]"
      style={DROP_SHADOW}
    >
      <Body4 className="pt-[7px] pl-[14px]">
        {displayLocation}
      </Body4>
    </View>
  );
};

export default DisplayLatLng;
