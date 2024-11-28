import classnames from "classnames";
import {
  KebabMenu,
  OverlayHeader
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import _ from "lodash";
import type { Node } from "react";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Share
} from "react-native";
import { openExternalWebBrowser } from "sharedHelpers/util.ts";
import {
  useTranslation
} from "sharedHooks";

const TAXON_URL = "https://www.inaturalist.org/taxa";

interface Props {
  invertToWhiteBackground: boolean
  taxonId: string
  hideNavButtons: boolean
}

const TaxonDetailsHeader = ( {
  invertToWhiteBackground,
  taxonId,
  hideNavButtons
}: Props ): Node => {
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );
  const { t } = useTranslation( );

  const taxonUrl = `${TAXON_URL}/${taxonId}`;

  return (
    <View
      className={classnames( "h-16 transparent z-10" )}
    >
      <OverlayHeader
        testID="TaxonDetails.BackButton"
        invertToWhiteBackground={invertToWhiteBackground}
        rightHeaderButton={!hideNavButtons && (
          <KebabMenu
            visible={kebabMenuVisible}
            setVisible={setKebabMenuVisible}
            large
            white={!invertToWhiteBackground}
          >
            <KebabMenu.Item
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
                  Alert.alert( err.message );
                  return null;
                }
              }}
              title={t( "Share" )}
            />
          </KebabMenu>
        )}
      />
    </View>
  );
};

export default TaxonDetailsHeader;
