// @flow

import * as React from "react";
import _ from "lodash";
import {
  Text, View, Pressable, useWindowDimensions, Linking, ActivityIndicator, ScrollView
} from "react-native";
import HTML from "react-native-render-html";
import { useRoute } from "@react-navigation/native";

import { useTranslation } from "react-i18next";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import PhotoScroll from "../SharedComponents/PhotoScroll";
import { viewStyles, textStyles } from "../../styles/taxonDetails";
import { useTaxonDetails } from "./hooks/useTaxonDetails";

const TaxonDetails = ( ): React.Node => {
  const { params } = useRoute( );
  const { id } = params;
  const { taxon, loading } = useTaxonDetails( id );
  // const similarSpecies = useSimilarSpecies( id );
  const { width } = useWindowDimensions( );
  const { t } = useTranslation();

  const displayTaxonomyList = React.useMemo( ( ) => {
    if ( !taxon || taxon.ancestors.length === 0 ) { return <View />; }
    return taxon.ancestors.map( ( ancestor, i ) => {
      const addIndent = index => index * 5;
      const currentTaxon = `${taxon.preferred_common_name} (${taxon.name})`;
      // TODO: make sure this design accounts for undefined common names
      const formattedAncestor = ancestor.preferred_common_name
        ? `${ancestor.preferred_common_name} (${ancestor.rank} ${ancestor.name})`
        : `(${ancestor.rank} ${ancestor.name})`;
      const displayAncestor = (
        <Text style={{ marginLeft: addIndent( i ) }}>
          {formattedAncestor}
        </Text>
      );
      const displayTaxon = <Text style={{ marginLeft: addIndent( i + 1 ) }}>{currentTaxon}</Text>;

      const lastAncestor = i === taxon.ancestors.length - 1;

      return (
        <View key={lastAncestor ? taxon.id : ancestor.id}>
          {displayAncestor}
          {lastAncestor && displayTaxon}
        </View>
      );
    } );
  }, [taxon] );

  if ( loading ) { return <ActivityIndicator />; }
  if ( !taxon ) { return null; }

  const openWikipedia = ( ) => Linking.openURL( taxon.wikipedia_url );

  return (
    <ViewWithFooter>
      <ScrollView
        contentContainerStyle={viewStyles.scrollView}
        testID={`TaxonDetails.${taxon.id}`}
      >
        <View style={viewStyles.photoContainer}>
          <PhotoScroll photos={_.compact( taxon.taxonPhotos.map( tp => tp.photo ) )} />
        </View>
        <View style={viewStyles.textContainer}>
          <Text>{taxon.rank}</Text>
          <Text>{taxon.preferred_common_name}</Text>
          <Text>{taxon.name}</Text>
          <Text style={textStyles.header}>{ t( "ABOUT-taxon-header" ) }</Text>
          <HTML
            contentWidth={width}
            source={{ html: taxon.wikipedia_summary }}
          />
          <Pressable
            onPress={openWikipedia}
            accessibilityRole="link"
            testID="TaxonDetails.wikipedia"
          >
            <Text style={textStyles.header}>{ t( "Read-more-on-Wikipedia" )}</Text>
          </Pressable>
          <Text style={textStyles.header}>{ t( "TAXONOMY-header" ) }</Text>
          {displayTaxonomyList}
          <Text style={textStyles.header}>{ t( "STATUS-header" ) }</Text>
          <Text style={textStyles.header}>{ t( "SIMILAR-SPECIES-header" ) }</Text>
        </View>
      </ScrollView>
    </ViewWithFooter>
  );
};

export default TaxonDetails;
