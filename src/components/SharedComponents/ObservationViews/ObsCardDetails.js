// @flow

import React from "react";
import { Text } from "react-native";
import type { Node } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { textStyles } from "../../../styles/sharedComponents/observationViews/obsCard";
import { formatObsListTime } from "../../../sharedHelpers/dateAndTime";
import checkCamelAndSnakeCase from "../../ObsDetails/helpers/checkCamelAndSnakeCase";

type Props = {
  item: Object
}

const ObsCardDetails = ( { item }: Props ): Node => {
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
    <>
      <Text style={textStyles.text} numberOfLines={1}>{displayName( )}</Text>
      <Text style={textStyles.text} numberOfLines={1}>
        <Icon name="map-marker" size={15} />
        {placeGuess || "no place guess"}
      </Text>
      <Text style={textStyles.text} numberOfLines={1}>
        <Icon name="clock" size={15} />
        {displayTime( )}
      </Text>
    </>
  );
};

export default ObsCardDetails;
