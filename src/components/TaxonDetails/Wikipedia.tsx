import { fontRegular } from "appConstants/fontFamilies";
import {
  Body2,
  Heading4,
} from "components/SharedComponents";
import * as React from "react";
import { useWindowDimensions } from "react-native";
import HTML, { defaultSystemFonts } from "react-native-render-html";
import { openExternalWebBrowser } from "sharedHelpers/util";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

interface Props {
  taxon: object;
}

const BASE_STYLE = {
  fontFamily: fontRegular,
  fontSize: 16,
  lineHeight: 22,
  color: colors.darkGray,
};

const FONTS = [fontRegular, ...defaultSystemFonts];

const Wikipedia = ( { taxon }: Props ) => {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();

  const openWikipedia = ( ) => {
    openExternalWebBrowser( taxon.wikipedia_url );
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
        defaultTextProps={{ allowFontScaling: true, maxFontSizeMultiplier: 2 }}
      />
      { taxon.wikipedia_url && taxon.wikipedia_url.length > 0 && (
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
