// @flow
import KebabMenu from "components/SharedComponents/KebabMenu";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import { Alert, Platform, Share } from "react-native";
import { Menu } from "react-native-paper";

const observationsUrl = "https://www.inaturalist.org/observations";

type Props = {
  observationId: number,
  white?: boolean
}

const HeaderKebabMenu = ( {
  observationId,
  white = true
}: Props ): Node => {
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );

  const url = `${observationsUrl}/${observationId?.toString( )}`;
  const sharingOptions = {
    url: "",
    message: ""
  };

  if ( Platform.OS === "ios" ) {
    sharingOptions.url = url;
  } else {
    sharingOptions.message = url;
  }

  const handleShare = async ( ) => {
    setKebabMenuVisible( false );
    try {
      return await Share.share( sharingOptions );
    } catch ( error ) {
      Alert.alert( error.message );
      return null;
    }
  };

  return (
    <KebabMenu
      visible={kebabMenuVisible}
      setVisible={setKebabMenuVisible}
      white={white}
      accessibilityLabel={t( "Observation-options" )}
      accessibilityHint={t( "Show-observation-options" )}
    >
      <Menu.Item
        onPress={handleShare}
        title={t( "Share" )}
        testID="MenuItem.Share"
      />
    </KebabMenu>
  );
};

export default HeaderKebabMenu;
