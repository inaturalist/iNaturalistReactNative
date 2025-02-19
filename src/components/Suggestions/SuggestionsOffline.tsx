import {
  Body2,
  Body3,
  INatIcon
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  reloadSuggestions: ( ) => void;
}

const SuggestionsOffline = ( {
  reloadSuggestions
}: Props ) => {
  const { t } = useTranslation( );
  return (
    <Pressable
      accessibilityRole="button"
      className="border-lightGray border-[3px] m-5 rounded-2xl"
      onPress={reloadSuggestions}
    >
      <View className="p-5">
        <View className="flex-row mb-2 items-center">
          <INatIcon
            name="offline"
            size={22}
            color={colors.mediumGray}
          />
          <Body2 className="mx-2">{t( "You-are-offline-Tap-to-reload" )}</Body2>
        </View>
        <Body3>{ t( "Offline-suggestions-may-differ-from-online" ) }</Body3>
      </View>
    </Pressable>
  );
};

export default SuggestionsOffline;
