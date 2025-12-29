import { useNavigation } from "@react-navigation/native";
import type { ApiTaxon } from "api/types";
import classnames from "classnames";
import {
  DisplayTaxonName,
  Heading3,
  INatIconButton,
  KebabMenu,
  OverlayHeader,
} from "components/SharedComponents";
import {
  View,
} from "components/styledComponents";
import _ from "lodash";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Share,
} from "react-native";
import type { RealmTaxon } from "realmModels/types";
import { openExternalWebBrowser } from "sharedHelpers/util";
import {
  useTranslation,
} from "sharedHooks";

const TAXON_URL = "https://www.inaturalist.org/taxa";

export const OPTIONS = "options";
export const SEARCH = "search";

interface Props {
  invertToWhiteBackground: boolean;
  taxon: ApiTaxon | RealmTaxon;
  hasTitle?: boolean;
  headerRightType?: typeof OPTIONS | typeof SEARCH;
  // By default this navigates to SuggestionsTaxonSearch
  onPressSearch?: ( ) => void;
}

const TaxonDetailsHeader = ( {
  invertToWhiteBackground,
  taxon,
  hasTitle,
  headerRightType,
  onPressSearch,
}: Props ) => {
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );
  const { t } = useTranslation( );
  const navigation = useNavigation();

  const taxonUrl = `${TAXON_URL}/${taxon?.id}`;

  let headerRight;
  if ( headerRightType === OPTIONS ) {
    headerRight = (
      <KebabMenu
        visible={kebabMenuVisible}
        setVisible={setKebabMenuVisible}
        large
        white={!invertToWhiteBackground}
      >
        <KebabMenu.Item
          isFirst
          testID="MenuItem.OpenInBrowser"
          onPress={( ) => {
            openExternalWebBrowser( taxonUrl );
            setKebabMenuVisible( false );
          }}
          title={t( "View-in-browser" )}
        />
        <KebabMenu.Item
          testID="MenuItem.Share"
          onPress={async ( ) => {
            const sharingOptions = {
              url: "",
              message: "",
            };

            if ( Platform.OS === "ios" ) {
              sharingOptions.url = taxonUrl;
            } else {
              sharingOptions.message = taxonUrl;
            }

            setKebabMenuVisible( false );

            try {
              return await Share.share( sharingOptions );
            } catch ( err ) {
              Alert.alert( ( err as Error ).message );
              return null;
            }
          }}
          title={t( "Share" )}
        />
      </KebabMenu>
    );
  } else if ( headerRightType === SEARCH ) {
    headerRight = (
      <INatIconButton
        icon="magnifying-glass"
        onPress={
          typeof ( onPressSearch ) === "function"
            ? ( ) => onPressSearch()
            : ( ) => navigation.navigate( "SuggestionsTaxonSearch" )
        }
        accessibilityLabel={t( "Search" )}
      />
    );
  }

  return (
    <View
      className={classnames( "h-16 transparent z-10" )}
    >
      <OverlayHeader
        testID="TaxonDetails.BackButton"
        invertToWhiteBackground={invertToWhiteBackground}
        headerRight={headerRight}
      >
        { hasTitle && (
          <DisplayTaxonName
            topTextComponent={Heading3}
            showOneNameOnly
            taxon={taxon}
            textCentered
          />
        ) }
      </OverlayHeader>
    </View>
  );
};

export default TaxonDetailsHeader;
