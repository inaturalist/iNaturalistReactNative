// @flow
import classnames from "classnames";
import { Body1, Body3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { generateTaxonPieces } from "sharedHelpers/taxon";

type Props = {
  item: Object,
  layout?: string,
};

const styles = StyleSheet.create( {
  commonName: {
    maxWidth: "100%"
  },
  scientificName: {
    fontStyle: "italic"
  }
} );

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
      testID="display-taxon-name"
      className={classnames( "flex", {
        "flex-row-reverse flex-wrap-reverse justify-end items-start":
          scientificNameFirst && isListView,
        "flex-row items-end flex-wrap": isListView && !scientificNameFirst,
        "w-11/12": isListView,
        "flex-col-reverse": !isListView && scientificNameFirst
      } )}
    >
      {taxonData.commonName && (
        <Body1 numberOfLines={3} style={styles.commonName}>
          {`${taxonData.commonName}${
            !scientificNameFirst && isListView ? " " : ""
          }`}
        </Body1>
      )}
      <Body3 style={styles.scientificName}>
        {`${taxonData.scientificName}${
          scientificNameFirst && isListView ? " " : ""
        }`}
      </Body3>
    </View>
  );
};

export default DisplayTaxonName;
