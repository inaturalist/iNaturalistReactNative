import {
  Body2,
  Body3,
  Button,
  INatIcon
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import { useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";

import AddCommentPrompt from "./AddCommentPrompt";
import CommentBox from "./CommentBox";
import ObsPhotoSelectionList from "./ObsPhotoSelectionList";

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
  showImproveWithLocationButton
}: Props ) => {
  const { t } = useTranslation( );
  const theme = useTheme( );

  return (
    <>
      <AddCommentPrompt />
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
      {showOfflineText && (
        <Pressable
          accessibilityRole="button"
          className="border border-warningYellow border-[3px] m-5 rounded-2xl"
          onPress={reloadSuggestions}
        >
          <View className="p-5">
            <View className="flex-row mb-2">
              <INatIcon
                name="offline"
                size={22}
                color={theme.colors.warningYellow}
              />
              <Body2 className="mx-2">{t( "You-are-offline-Tap-to-reload" )}</Body2>
            </View>
            <Body3>{ t( "Offline-suggestions-do-not-use-your-location" ) }</Body3>
          </View>
        </Pressable>
      )}
      <CommentBox />
    </>
  );
};

export default SuggestionsHeader;
