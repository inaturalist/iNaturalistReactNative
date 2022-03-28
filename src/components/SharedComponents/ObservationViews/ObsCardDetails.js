// @flow

import React from "react";
import { Text } from "react-native";
import type { Node } from "react";

import { textStyles } from "../../../styles/sharedComponents/observationViews/obsCard";

type Props = {
  item: Object
}

const ObsCardDetails = ( { item }: Props ): Node => {
  const commonName = item.taxon && ( item.taxon.preferredCommonName || item.taxon.preferred_common_name );
  const placeGuess = item.placeGuess || item.place_guess;
  const timeObserved = item.timeObservedAt || item.time_observed_at;

  return (
    <>
      <Text style={textStyles.text} numberOfLines={1}>{commonName || "no common name"}</Text>
      <Text style={textStyles.text} numberOfLines={1}>{placeGuess || "no place guess"}</Text>
      <Text style={textStyles.text} numberOfLines={1}>{timeObserved || "no time given"}</Text>
    </>
  );
};

export default ObsCardDetails;





