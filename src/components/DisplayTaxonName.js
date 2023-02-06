// @flow
import classnames from "classnames";
import { Body1, Body3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { generateTaxonPieces } from "sharedHelpers/taxon";

type Props = {
  item: Object,
  layout: String,
};

const DisplayTaxonName = ( {
  layout = "list",
  item: { user, taxon }
}: Props ): Node => {
  const { t } = useTranslation();

  if ( !taxon ) {
    return <Body1 numberOfLines={1}>{t( "unknown" )}</Body1>;
  }

  const taxonData = generateTaxonPieces( taxon );

  const isListView = layout === "list";
  const scientificNameFirst = user?.prefers_scientific_name_first;

  return (
    <View
      className={classnames( "flex flex-wrap", {
        "flex-row-reverse": isListView && scientificNameFirst,
        "justify-end": isListView && scientificNameFirst,
        "flex-row items-end": isListView,
        "w-11/12": isListView,
        "flex-col-reverse": !isListView && scientificNameFirst,
        "w-10/12": !isListView
      } )}
    >
      {taxonData.commonName && (
        <Body1 numberOfLines={3} ellipsizeMode="tail">
          {`${taxonData.commonName}${
            !scientificNameFirst && isListView ? " " : ""
          }`}
        </Body1>
      )}
      <Body3>
        {`${taxonData.scientificName}${
          scientificNameFirst && isListView ? " " : ""
        }`}
      </Body3>
    </View>
  );
};

export default DisplayTaxonName;
