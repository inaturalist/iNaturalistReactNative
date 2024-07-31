import { useRoute } from "@react-navigation/native";
import {
  ActivityIndicator,
  Body1
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

import Suggestion from "./Suggestion";

interface Props {
  onTaxonChosen: Function
}

const SuggestionsLoading = ( {
  onTaxonChosen
}: Props ): Node => {
  const { t } = useTranslation( );
  const { params } = useRoute( );
  const { aiCameraSuggestion } = params;

  const displayAICameraSuggestion = ( ) => (
    <>
      <View className="pt-6" />
      <Suggestion
        accessibilityLabel={t( "Choose-taxon" )}
        fetchRemote={false}
        suggestion={aiCameraSuggestion}
        onTaxonChosen={onTaxonChosen}
      />
    </>
  );

  return (
    <View className="justify-center items-center mt-5" testID="SuggestionsList.loading">
      <ActivityIndicator size={50} />
      <Body1 className="pt-6">{t( "iNaturalist-is-loading-ID-suggestions" )}</Body1>
      {aiCameraSuggestion && displayAICameraSuggestion( )}
    </View>
  );
};

export default SuggestionsLoading;
