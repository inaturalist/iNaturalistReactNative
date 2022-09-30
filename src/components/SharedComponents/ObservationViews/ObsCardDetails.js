// @flow

import type { Node } from "react";
import React from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { formatObsListTime } from "../../../sharedHelpers/dateAndTime";
import checkCamelAndSnakeCase from "../../ObsDetails/helpers/checkCamelAndSnakeCase";
import { Text, View } from "../../styledComponents";

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
    <View className={view === "grid" && "border-2 border-border w-44"}>
      <Text numberOfLines={1}>{displayName( )}</Text>
      <Text numberOfLines={1}>
        <Icon name="map-marker" size={15} />
        {placeGuess || "no place guess"}
      </Text>
      <Text numberOfLines={1}>
        <Icon name="clock" size={15} />
        {displayTime( )}
      </Text>
    </View>
  );
};

export default ObsCardDetails;
