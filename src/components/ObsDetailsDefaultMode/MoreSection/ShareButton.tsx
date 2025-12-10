import {
  Body3
} from "components/SharedComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Alert, Platform, Share } from "react-native";

type Props = {
  id: number;
}

const OBSERVATION_URL = "https://www.inaturalist.org/observations";

const handleShare = async url => {
  const sharingOptions = {
    url: "",
    message: ""
  };
  if ( Platform.OS === "ios" ) {
    sharingOptions.url = url;
  } else {
    sharingOptions.message = url;
  }
  try {
    return await Share.share( sharingOptions );
  } catch ( err ) {
    Alert.alert( err.message );
    return null;
  }
};

const ShareButton = ( { id }: Props ): Node => (
  <Body3
    className="underline mt-[11px]"
    onPress={() => handleShare( `${OBSERVATION_URL}/${id}` )}
  >
    {t( "Share" )}
  </Body3>
);

export default ShareButton;
