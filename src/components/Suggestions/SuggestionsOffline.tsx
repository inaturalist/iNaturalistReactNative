import {
  Body2,
  Body3,
  INatIcon
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import { useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";

interface Props {
  reloadSuggestions: ( ) => void;
}

const SuggestionsOffline = ( {
  reloadSuggestions
}: Props ) => {
  const { t } = useTranslation( );
  const theme = useTheme( );
  return (
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
  );
};

export default SuggestionsOffline;
