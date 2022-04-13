// @flow

import React from "react";
import { Text } from "react-native";
import type { Node } from "react";

import { textStyles } from "../../../styles/sharedComponents/observationViews/obsCard";
import { formatObsListTime } from "../../../sharedHelpers/dateAndTime";

type Props = {
  item: Object,
  needsUpload: boolean
}

const ObsCardDetails = ( { item, needsUpload }: Props ): Node => {
  const placeGuess = item.placeGuess || item.place_guess;
  const timeObserved = formatObsListTime( item.timeObservedAt || item.time_observed_at );

  const displayName = ( ) => {
    if ( needsUpload ) {
      return item.species_guess || "no name";
    } else {
      return item.taxon ? ( item.taxon.preferredCommonName || item.taxon.preferred_common_name ) : "no name";
    }
  };

  return (
    <>
      <Text style={textStyles.text} numberOfLines={1}>{displayName( )}</Text>
      <Text style={textStyles.text} numberOfLines={1}>{placeGuess || "no place guess"}</Text>
      <Text style={textStyles.text} numberOfLines={1}>{timeObserved || "no time given"}</Text>
    </>
  );
};

export default ObsCardDetails;





