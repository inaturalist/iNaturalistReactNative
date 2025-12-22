import {
  ActivityIndicator,
  Body1,
} from "components/SharedComponents";
import {
  View,
} from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

import Suggestion from "./Suggestion";

interface Props {
  onTaxonChosen: ( ) => void;
}

const SuggestionsLoading = ( {
  onTaxonChosen,
}: Props ) => {
  const { t } = useTranslation( );
  const aiCameraSuggestion = useStore( state => state.aICameraSuggestion );
  const hasAICameraSuggestion = aiCameraSuggestion !== null;

  const displayAICameraSuggestion = ( ) => (
    <>
      <View className="pt-6" />
      <Suggestion
        accessibilityLabel={t( "Choose-taxon" )}
        suggestion={aiCameraSuggestion}
        onTaxonChosen={onTaxonChosen}
      />
    </>
  );

  return (
    <View className="justify-center items-center mt-5" testID="SuggestionsList.loading">
      <ActivityIndicator size={50} />
      <Body1 className="pt-6">{t( "iNaturalist-is-loading-ID-suggestions" )}</Body1>
      {hasAICameraSuggestion && displayAICameraSuggestion( )}
    </View>
  );
};

export default SuggestionsLoading;
