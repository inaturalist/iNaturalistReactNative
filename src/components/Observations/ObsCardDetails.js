// @flow

import DisplayTaxonName from "components/DisplayTaxonName";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import { Body4, DateDisplay } from "components/SharedComponents";
import { Text, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

type Props = {
  observation: Object,
  view?: string,
};

const ObsCardDetails = ( { observation, view = "list" }: Props ): Node => {
  const { t } = useTranslation( );
  let displayLocation = checkCamelAndSnakeCase( observation, "placeGuess" );
  if ( !displayLocation && observation.latitude ) {
    displayLocation = `${observation.latitude}, ${observation.longitude}`;
  }
  if ( !displayLocation ) {
    displayLocation = t( "Missing-Location" );
  }
  return (
    <View className={view === "grid" && "border border-border p-2"}>
      <DisplayTaxonName
        taxon={observation.taxon}
        scientificNameFirst={observation?.user?.prefers_scientific_name_first}
        layout={view === "list" ? "horizontal" : "vertical"}
      />
      <Text numberOfLines={1} className="mb-2">
        <IconMaterial name="location-pin" size={15} />
        <Body4 className="text-darkGray ml-[5px]">{displayLocation}</Body4>
      </Text>
      <DateDisplay dateString={observation.time_observed_at || observation.observed_on_string} />
    </View>
  );
};

export default ObsCardDetails;
