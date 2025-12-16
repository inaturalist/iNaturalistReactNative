import {
  Button,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

import ObsPhotoSelectionList from "./ObsPhotoSelectionList";
import SuggestionsOffline from "./SuggestionsOffline";

interface Props {
  onPressPhoto: ( _uri: string ) => void;
  photoUris: string[];
  reloadSuggestions: ( ) => void;
  selectedPhotoUri: string;
  showOfflineText: boolean;
  improveWithLocationButtonOnPress: () => void;
  showImproveWithLocationButton: boolean;
}

const SuggestionsHeader = ( {
  onPressPhoto,
  photoUris,
  reloadSuggestions,
  selectedPhotoUri,
  showOfflineText,
  improveWithLocationButtonOnPress,
  showImproveWithLocationButton,
}: Props ) => {
  const { t } = useTranslation( );

  return (
    <>
      <View className="mx-5">
        <ObsPhotoSelectionList
          photoUris={photoUris}
          selectedPhotoUri={selectedPhotoUri}
          onPressPhoto={onPressPhoto}
        />
      </View>
      {showImproveWithLocationButton && (
        <View className="mx-5 mt-5">
          <Button
            text={t( "IMPROVE-THESE-SUGGESTIONS-BY-USING-YOUR-LOCATION" )}
            accessibilityHint={t( "Opens-location-permission-prompt" )}
            level="focus"
            onPress={improveWithLocationButtonOnPress}
          />
        </View>
      )}
      {showOfflineText && <SuggestionsOffline reloadSuggestions={reloadSuggestions} />}
    </>
  );
};

export default SuggestionsHeader;
