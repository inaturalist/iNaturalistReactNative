// @flow

import * as React from "react";
import { Text, View, Pressable } from "react-native";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import PhotoScroll from "../ObsDetails/PhotoScroll";
import { viewStyles } from "../../styles/obsDetails";
import useFetchTaxonDetails from "./hooks/fetchTaxonDetails";

const TaxonDetails = ( ): React.Node => {
  const taxon = useFetchTaxonDetails( 3 );

  if ( !taxon ) { return null; }
  return (
    <ViewWithFooter>
      <View style={viewStyles.photoContainer}>
        <PhotoScroll photos={taxon.taxonPhotos} />
      </View>
      <Text>{taxon.rank}</Text>
      <Text>{taxon.preferred_common_name}</Text>
      <Text>{taxon.name}</Text>
      <Text>ABOUT</Text>
      <Text>{taxon.wikipedia_summary}</Text>
      <Pressable>
        <Text>Read more on Wikipedia</Text>
      </Pressable>
      <Text>TAXONOMY</Text>
      {taxon.ancestors.map( ( ancestor, i ) => {
        const currentTaxon = `${taxon.preferred_common_name} (${taxon.rank} ${taxon.name})`;
        const formattedAncestor = `${ancestor.preferred_common_name} (${ancestor.rank} ${ancestor.name})`;
        const displayAncestor = <Text key={ancestor.id}>{formattedAncestor}</Text>;
        const displayTaxon = <Text key={taxon.id}>{currentTaxon}</Text>;

        return (
          <>
            {displayAncestor}
            {i === taxon.ancestors.length - 1 && displayTaxon}
          </>
        );
      } )}
    </ViewWithFooter>
  );
};

export default TaxonDetails;

