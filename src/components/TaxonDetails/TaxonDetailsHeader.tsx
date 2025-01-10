import type { ApiTaxon } from "api/types";
import classnames from "classnames";
import {
  DisplayTaxonName,
  KebabMenu,
  OverlayHeader
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import _ from "lodash";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Share
} from "react-native";
import type { RealmTaxon } from "realmModels/types";
import { openExternalWebBrowser } from "sharedHelpers/util.ts";
import {
  useTranslation
} from "sharedHooks";

const TAXON_URL = "https://www.inaturalist.org/taxa";

interface Props {
  invertToWhiteBackground: boolean;
  taxon: ApiTaxon | RealmTaxon;
  hasTitle?: boolean;
  hideNavButtons: boolean;
}

const TaxonDetailsHeader = ( {
  invertToWhiteBackground,
  taxon,
  hasTitle,
  hideNavButtons
}: Props ) => {
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );
  const { t } = useTranslation( );

  const taxonUrl = `${TAXON_URL}/${taxon?.id}`;

  let headerRight;
  if ( !hideNavButtons ) {
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
              message: ""
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
            taxon={taxon}
            showOneNameOnly
          />
        ) }
      </OverlayHeader>
    </View>
  );
};

export default TaxonDetailsHeader;
