// @flow

import { fontRegular } from "appConstants/fontFamilies.ts";
import {
  Body2,
  Heading4
} from "components/SharedComponents";
import * as React from "react";
import { useWindowDimensions } from "react-native";
import HTML, { defaultSystemFonts } from "react-native-render-html";
import { openExternalWebBrowser } from "sharedHelpers/util.ts";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

type Props = {
  taxon: Object
}

const BASE_STYLE = {
  fontFamily: fontRegular,
  fontSize: 16,
  lineHeight: 22,
  color: colors.darkGray
};

const FONTS = [fontRegular, ...defaultSystemFonts];

const Wikipedia = ( { taxon }: Props ): React.Node => {
  const { width } = useWindowDimensions();
  const { t, i18n } = useTranslation();
  const { language } = i18n;


  let wikipediaUrl = taxon.wikipedia_url;

  // Trivial fallback that will suffer from all the same problems we've had
  // doing the same thing on the web. Instead we should use the
  // taxa/:id/describe endpoint to retrieve a description and a URL like we
  // do on the web
  if ( !wikipediaUrl ) {
    const lang = language?.split( "-" )?.[0] || "en";
    wikipediaUrl = `https://${lang}.wikipedia.org/wiki/${taxon.name}`;
  }

  const openWikipedia = ( ) => {
    if ( wikipediaUrl ) {
      openExternalWebBrowser( wikipediaUrl );
    }
  };


  if ( !taxon.wikipedia_summary || taxon.wikipedia_summary.length === 0 ) {
    return null;
  }

  return (
    <>
      <Heading4 className="mb-3">{t( "WIKIPEDIA" )}</Heading4>
      <HTML
        contentWidth={width}
        source={{ html: taxon.wikipedia_summary }}
        systemFonts={FONTS}
        baseStyle={BASE_STYLE}
      />
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
