// @flow

import {
  ActivityIndicator,
  Body2,
  Heading4
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import {
  Linking,
  Platform,
  useWindowDimensions
} from "react-native";
import HTML, { defaultSystemFonts } from "react-native-render-html";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  taxon?: Object,
  isLoading: boolean,
  isError: boolean
}

const About = ( { taxon, isLoading, isError }: Props ): React.Node => {
  const { width } = useWindowDimensions();
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

  const openWikipedia = () => {
    if ( taxon?.wikipedia_url ) {
      Linking.openURL( taxon.wikipedia_url );
    }
  };

  const baseStyle = {
    fontFamily: `Whitney-Light${Platform.OS === "ios"
      ? ""
      : "-Pro"}`,
    fontSize: 16,
    lineHeight: 22
  };
  const fonts = ["Whitney-Light", "Whitney-Light-Pro", ...defaultSystemFonts];

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
      <Heading4 className="my-3">{t( "STATUS-header" )}</Heading4>
      <Heading4 className="my-3">{t( "WIKIPEDIA" )}</Heading4>
      {taxon?.wikipedia_summary && (
        <HTML
          contentWidth={width}
          source={{ html: taxon.wikipedia_summary }}
          systemFonts={fonts}
          baseStyle={baseStyle}
        />
      )}
      { taxon.wikipedia_url && (
        <Body2
          onPress={openWikipedia}
          accessibilityRole="link"
          testID="TaxonDetails.wikipedia"
          className="my-3 color-inatGreen underline"
        >
          {t( "Read-more-on-Wikipedia" )}

        </Body2>
      ) }
      <Heading4 className="my-3">
        {t( "TAXONOMY-header" )}
      </Heading4>
      {displayTaxonomyList}
    </View>
  );
};

export default About;
