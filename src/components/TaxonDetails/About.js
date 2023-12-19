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
import { useTranslation } from "sharedHooks";

import Taxonomy from "./Taxonomy";

type Props = {
  taxon?: Object,
  isLoading: boolean,
  isError: boolean
}

const About = ( { taxon, isLoading, isError }: Props ): React.Node => {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();

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
      <Taxonomy taxon={taxon} />
    </View>
  );
};

export default About;
