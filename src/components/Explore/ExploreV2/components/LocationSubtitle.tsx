import INatIcon from "components/SharedComponents/INatIcon";
import Body3 from "components/SharedComponents/Typography/Body3";
import { View } from "components/styledComponents";
import React from "react";

interface Props {
  place: string;
}

const LocationSubtitle = ( { place }: Props ) => {
  if ( !place ) { return null; }
  return (
    <View className="flex-row items-center pt-[5px]">
      <View className="w-[15px] items-center">
        <INatIcon name="location" size={15} />
      </View>
      <Body3
        maxFontSizeMultiplier={1.5}
        className="ml-[5px]"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {place}
      </Body3>
    </View>
  );
};

export default LocationSubtitle;
