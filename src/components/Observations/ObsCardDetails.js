// @flow

import DisplayTaxonName from "components/DisplayTaxonName";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import DateDisplay from "components/SharedComponents/DateDisplay";
import { Text, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

type Props = {
  item: Object,
  view?: string,
};

const ObsCardDetails = ( { item = "list", view }: Props ): Node => {
  const placeGuess = checkCamelAndSnakeCase( item, "placeGuess" );

  return (
    <View className={view === "grid" && "border border-border p-2"}>
      <DisplayTaxonName
        taxon={item.taxon}
        scientificNameFirst={item?.user?.prefers_scientific_name_first}
        layout={view === "list" ? "horizontal" : "vertical"}
      />
      <Text numberOfLines={1} className="mb-2">
        <IconMaterial name="location-pin" size={15} />
        {placeGuess || "no place guess"}
      </Text>
      <DateDisplay dateTime={item.time_observed_at} />
    </View>
  );
};

export default ObsCardDetails;
