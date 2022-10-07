// @flow

import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import { Text, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import { formatObsListTime } from "sharedHelpers/dateAndTime";

type Props = {
  item: Object,
  view?: string
}

const ObsCardDetails = ( { item, view }: Props ): Node => {
  const placeGuess = checkCamelAndSnakeCase( item, "placeGuess" );

  const displayTime = ( ) => {
    if ( item._created_at ) {
      return formatObsListTime( item._created_at );
    }
    return "no time given";
  };

  const displayName = ( ) => ( item.taxon
    ? checkCamelAndSnakeCase( item.taxon, "preferredCommonName" )
    : "no name"
  );

  return (
    <View className={view === "grid" ? "border border-border w-44" : "w-2/3"}>
      <Text numberOfLines={1}>{displayName( )}</Text>
      <Text numberOfLines={1}>
        <IconMaterial name="location-pin" size={15} />
        {placeGuess || "no place guess"}
      </Text>
      <Text numberOfLines={1}>
        <IconMaterial name="watch-later" size={15} />
        {displayTime( )}
      </Text>
    </View>
  );
};

export default ObsCardDetails;
