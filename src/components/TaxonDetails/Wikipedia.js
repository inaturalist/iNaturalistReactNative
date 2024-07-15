// @flow

import { fontRegular } from "appConstants/fontFamilies.ts";
import {
  Body2,
  Heading4
} from "components/SharedComponents";
import * as React from "react";
import {
  Linking,
  useWindowDimensions
} from "react-native";
import HTML, { defaultSystemFonts } from "react-native-render-html";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

type Props = {
  taxon: Object
}

const Wikipedia = ( { taxon }: Props ): React.Node => {
  const { width } = useWindowDimensions();
  const { t, i18n } = useTranslation();
  const { language } = i18n;

  const openWikipedia = ( ) => {
    if ( taxon?.wikipedia_url ) {
      Linking.openURL( taxon.wikipedia_url );
    }
  };

  const baseStyle = {
    fontFamily: fontRegular,
    fontSize: 16,
    lineHeight: 22,
    color: colors.darkGray
  };
  const fonts = [fontRegular, ...defaultSystemFonts];

  let wikipediaUrl = taxon.wikipedia_url;

  // Trivial fallback that will suffer from all the same problems we've had
  // doing the same thing on the web. Instead we should use the
  // taxa/:id/describe endpoint to retrieve a description and a URL like we
  // do on the web
  if ( !wikipediaUrl ) {
    const lang = language?.split( "-" )?.[0] || "en";
    wikipediaUrl = `https://${lang}.wikipedia.org/wiki/${taxon.name}`;
  }

  if ( !taxon.wikipedia_summary || taxon.wikipedia_summary.length === 0 ) {
    return null;
  }

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
      { wikipediaUrl && (
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
