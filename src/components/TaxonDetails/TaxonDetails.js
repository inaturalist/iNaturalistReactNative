// @flow

import { useRoute } from "@react-navigation/native";
import fetchTaxon from "api/taxa";
import PhotoScroll from "components/SharedComponents/PhotoScroll";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import _ from "lodash";
import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator, Linking, Pressable, ScrollView, Text, useWindowDimensions,
  View
} from "react-native";
import HTML from "react-native-render-html";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import { textStyles, viewStyles } from "styles/taxonDetails";

const TaxonDetails = ( ): React.Node => {
  const { params } = useRoute( );
  const { id } = params;
  // Note that we want to authenticate this to localize names, desc language, etc.
  const {
    data, isLoading, isError
  } = useAuthenticatedQuery(
    ["fetchTaxon", id],
    optsWithAuth => fetchTaxon( id, {}, optsWithAuth )
  );
  const taxon = data;
  const { width } = useWindowDimensions( );
  const { t } = useTranslation();

  const displayTaxonomyList = React.useMemo( ( ) => {
    if ( !taxon || taxon.ancestors?.length === 0 ) { return <View />; }
    return taxon.ancestors?.map( ( ancestor, i ) => {
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

  const openWikipedia = ( ) => Linking.openURL( taxon.wikipedia_url );

  const renderContent = ( ) => {
    if ( isLoading ) { return <ActivityIndicator />; }

    if ( isError || !taxon ) {
      return <Text>{t( "Error-Could-Not-Fetch-Taxon" )}</Text>;
    }

    return (
      <>
        <Text>{taxon.rank}</Text>
        <Text>{taxon.preferred_common_name}</Text>
        <Text>{taxon.name}</Text>
        <Text style={textStyles.header}>{ t( "ABOUT-taxon-header" ) }</Text>
        { taxon.wikipedia_summary && (
          <HTML
            contentWidth={width}
            source={{ html: taxon.wikipedia_summary }}
          />
        ) }
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
      </>
    );
  };

  return (
    <ViewWithFooter>
      <ScrollView
        contentContainerStyle={viewStyles.scrollView}
        testID={`TaxonDetails.${taxon?.id}`}
      >
        <View style={viewStyles.photoContainer}>
          {taxon && <PhotoScroll photos={_.compact( taxon.taxonPhotos?.map( tp => tp.photo ) )} />}
        </View>
        <View style={viewStyles.textContainer}>
          {renderContent( )}
        </View>
      </ScrollView>
    </ViewWithFooter>
  );
};

export default TaxonDetails;
