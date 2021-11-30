// @flow

import * as React from "react";
import { Text, View, Pressable, useWindowDimensions, Linking } from "react-native";
import HTML from "react-native-render-html";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import PhotoScroll from "../ObsDetails/PhotoScroll";
import { viewStyles, textStyles } from "../../styles/taxonDetails";
import useFetchTaxonDetails from "./hooks/fetchTaxonDetails";

const TaxonDetails = ( ): React.Node => {
  const taxon = useFetchTaxonDetails( 3 );
  const { width } = useWindowDimensions( );

  if ( !taxon ) { return null; }

  const openWikipedia = ( ) => Linking.openURL( taxon.wikipedia_url );

  return (
    <ViewWithFooter>
      <View style={viewStyles.photoContainer}>
        <PhotoScroll photos={taxon.taxonPhotos} />
      </View>
      <View style={viewStyles.textContainer}>
      <Text>{taxon.rank}</Text>
      <Text>{taxon.preferred_common_name}</Text>
      <Text>{taxon.name}</Text>
      <Text style={textStyles.header}>ABOUT</Text>
      <HTML
        contentWidth={width}
        source={{ html: taxon.wikipedia_summary }}
      />
      <Pressable onPress={openWikipedia}>
        <Text style={textStyles.header}>Read more on Wikipedia</Text>
      </Pressable>
      <Text style={textStyles.header}>TAXONOMY</Text>
      {taxon.ancestors.map( ( ancestor, i ) => {
        const addIndent = index => index * 5;
        const currentTaxon = `${taxon.preferred_common_name} (${taxon.name})`;
        const formattedAncestor = `${ancestor.preferred_common_name} (${ancestor.rank} ${ancestor.name})`;
        const displayAncestor = <Text key={ancestor.id} style={{ marginLeft: addIndent( i ) }}>{formattedAncestor}</Text>;
        const displayTaxon = <Text key={taxon.id} style={{ marginLeft: addIndent( i + 1 ) }}>{currentTaxon}</Text>;

        return (
          <>
            {displayAncestor}
            {i === taxon.ancestors.length - 1 && displayTaxon}
          </>
        );
      } )}
      </View>
    </ViewWithFooter>
  );
};

export default TaxonDetails;

