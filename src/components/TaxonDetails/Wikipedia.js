// @flow

import {
  Body2,
  Heading4
} from "components/SharedComponents";
import * as React from "react";
import {
  Linking,
  Platform,
  useWindowDimensions
} from "react-native";
import HTML, { defaultSystemFonts } from "react-native-render-html";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  taxon: Object
}

const Wikipedia = ( { taxon }: Props ): React.Node => {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();

  const openWikipedia = ( ) => {
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

  return (
    <>
      <Heading4 className="mb-3">{t( "WIKIPEDIA" )}</Heading4>
      {taxon.wikipedia_summary && (
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
    </>
  );
};

export default Wikipedia;
