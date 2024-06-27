import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Body2,
  Body3,
  // Button,
  INatIcon,
  INatIconButton
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useEffect } from "react";
import { useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";

import AddCommentPrompt from "./AddCommentPrompt";
import CommentBox from "./CommentBox";
import ObsPhotoSelectionList from "./ObsPhotoSelectionList";

type Props = {
  loading: boolean,
  onPressPhoto: Function,
  photoUris: Array<string>,
  reloadSuggestions: Function,
  selectedPhotoUri: string,
  // setLocationPermissionNeeded: Function,
  // showImproveWithLocationButton: boolean,
  usingOfflineSuggestions: boolean
};

const SuggestionsHeader = ( {
  loading,
  onPressPhoto,
  photoUris,
  reloadSuggestions,
  selectedPhotoUri,
  // setLocationPermissionNeeded,
  // showImproveWithLocationButton,
  usingOfflineSuggestions
}: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { lastScreen } = params;
  const theme = useTheme( );

  const headerRight = useCallback( ( ) => (
    <INatIconButton
      icon="magnifying-glass"
      onPress={( ) => navigation.navigate( "TaxonSearch", { lastScreen } )}
      accessibilityLabel={t( "Search" )}
    />
  ), [navigation, lastScreen, t] );

  useEffect( ( ) => {
    navigation.setOptions( { headerRight } );
  }, [headerRight, navigation] );

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
      {/* {showImproveWithLocationButton && (
        <View className="mx-5 mt-5">
          <Button
            text={t( "IMPROVE-THESE-SUGGESTIONS-BY-USING-YOUR-LOCATION" )}
            accessibilityHint={t( "Opens-location-permission-prompt" )}
            level="focus"
            onPress={( ) => setLocationPermissionNeeded( true )}
          />
        </View>
      )} */}
      {( !loading && usingOfflineSuggestions ) && (
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
