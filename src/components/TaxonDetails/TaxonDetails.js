// @flow

import { useRoute } from "@react-navigation/native";
import fetchTaxon from "api/taxa";
import PhotoScroll from "components/SharedComponents/PhotoScroll";
import ScrollViewWrapper from "components/SharedComponents/ScrollViewWrapper";
import { Pressable, Text, View } from "components/styledComponents";
import _ from "lodash";
import * as React from "react";
import { ActivityIndicator, Linking, useWindowDimensions } from "react-native";
import HTML from "react-native-render-html";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useTranslation from "sharedHooks/useTranslation";

const TaxonDetails = (): React.Node => {
  const { params } = useRoute();
  const { id } = params;
  // Note that we want to authenticate this to localize names, desc language, etc.
  const { data, isLoading, isError } = useAuthenticatedQuery(
    ["fetchTaxon", id],
    optsWithAuth => fetchTaxon( id, {}, optsWithAuth )
  );
  const taxon = data;
  const { width } = useWindowDimensions();
  const { t } = useTranslation();

  const displayTaxonomyList = React.useMemo( () => {
    if ( !taxon || taxon.ancestors?.length === 0 ) {
      return <View />;
    }
    return taxon.ancestors?.map( ( ancestor, i ) => {
      const addIndent = index => index * 5;
      const currentTaxon = `${taxon.preferred_common_name} (${taxon.name})`;
      // TODO: make sure this design accounts for undefined common names
      const formattedAncestor = ancestor.preferred_common_name
        ? `${ancestor.preferred_common_name} (${ancestor.rank} ${ancestor.name})`
        : `(${ancestor.rank} ${ancestor.name})`;
      const displayAncestor = (
        <Text style={{ marginLeft: addIndent( i ) }}>{formattedAncestor}</Text>
      );
      const displayTaxon = (
        <Text style={{ marginLeft: addIndent( i + 1 ) }}>{currentTaxon}</Text>
      );

      const lastAncestor = i === taxon.ancestors.length - 1;

      return (
        <View key={lastAncestor ? taxon.id : ancestor.id}>
          {displayAncestor}
          {lastAncestor && displayTaxon}
        </View>
      );
    } );
  }, [taxon] );

  const openWikipedia = () => Linking.openURL( taxon.wikipedia_url );

  const renderContent = () => {
    if ( isLoading ) {
      return <ActivityIndicator />;
    }

    if ( isError || !taxon ) {
      return <Text>{t( "Error-Could-Not-Fetch-Taxon" )}</Text>;
    }

    return (
      <>
        <Text>{taxon.rank}</Text>
        <Text>{taxon.preferred_common_name}</Text>
        <Text>{taxon.name}</Text>
        <Text className="text-lg text-darkGray my-3">
          {t( "ABOUT-taxon-header" )}
        </Text>
        {taxon.wikipedia_summary && (
          <HTML
            contentWidth={width}
            source={{ html: taxon.wikipedia_summary }}
          />
        )}
        <Pressable
          onPress={openWikipedia}
          accessibilityRole="link"
          testID="TaxonDetails.wikipedia"
        >
          <Text className="my-3">{t( "Read-more-on-Wikipedia" )}</Text>
        </Pressable>
        <Text className="text-lg text-darkGray my-3">
          {t( "TAXONOMY-header" )}
        </Text>
        {displayTaxonomyList}
        <Text className="text-lg text-darkGray my-3">{t( "STATUS-header" )}</Text>
        <Text className="pb-32 text-lg text-darkGray my-3">
          {t( "SIMILAR-SPECIES-header" )}
        </Text>
      </>
    );
  };

  return (
    <ScrollViewWrapper testID={`TaxonDetails.${taxon?.id}`}>
      <View className="bg-black">
        {taxon && (
          <PhotoScroll
            photos={_.compact( taxon.taxonPhotos?.map( tp => tp.photo ) )}
          />
        )}
      </View>
      <View className="m-5">{renderContent()}</View>
    </ScrollViewWrapper>
  );
};

export default TaxonDetails;
