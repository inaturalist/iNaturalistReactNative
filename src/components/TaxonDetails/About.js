// @flow

import {
  ActivityIndicator,
  Body2,
  Heading4
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import { useTranslation } from "sharedHooks";

import EstablishmentMeans from "./EstablishmentMeans";
import Wikipedia from "./Wikipedia";

type Props = {
  taxon?: Object,
  isLoading: boolean,
  isError: boolean
}

const About = ( { taxon, isLoading, isError }: Props ): React.Node => {
  const { t } = useTranslation();

  const displayTaxonomyList = React.useMemo( () => {
    if ( !taxon || taxon.ancestors?.length === 0 ) {
      return <View />;
    }
    return taxon.ancestors?.map( ( ancestor, i ) => {
      const currentTaxon = `${taxon.preferred_common_name} (${taxon.name})`;
      // TODO: make sure this design accounts for undefined common names
      const formattedAncestor = ancestor.preferred_common_name
        ? `${ancestor.preferred_common_name} (${ancestor.rank} ${ancestor.name})`
        : `(${ancestor.rank} ${ancestor.name})`;
      const displayAncestor = (
        <Body2>{formattedAncestor}</Body2>
      );
      const displayTaxon = (
        <Body2>{currentTaxon}</Body2>
      );

      const lastAncestor = i === taxon.ancestors.length - 1;

      return (
        <View key={lastAncestor
          ? taxon.id
          : ancestor.id}
        >
          {displayAncestor}
          {lastAncestor && displayTaxon}
        </View>
      );
    } );
  }, [taxon] );

  if ( isLoading ) {
    return <View className="m-3"><ActivityIndicator /></View>;
  }

  if ( isError || !taxon ) {
    return (
      <View className="m-3">
        <Body2>{t( "Error-Could-Not-Fetch-Taxon" )}</Body2>
      </View>
    );
  }

  return (
    <View className="mx-3">
      <EstablishmentMeans taxon={taxon} />
      <Wikipedia taxon={taxon} />
      <Heading4 className="my-3">
        {t( "TAXONOMY-header" )}
      </Heading4>
      {displayTaxonomyList}
    </View>
  );
};

export default About;
