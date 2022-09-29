// @flow

import type { Node } from "react";
import React from "react";
import { Text } from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

import { formatObsListTime } from "../../../sharedHelpers/dateAndTime";
import { textStyles } from "../../../styles/sharedComponents/observationViews/obsCard";
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
        <IconMaterial name="location-pin" size={15} />
        {placeGuess || "no place guess"}
      </Text>
      <Text style={textStyles.text} numberOfLines={1}>
        <IconMaterial name="watch-later" size={15} />
        {displayTime( )}
      </Text>
    </>
  );
};

export default ObsCardDetails;
