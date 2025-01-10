import { CustomFlashList, Heading3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import {
  convertOfflineScoreToConfidence,
  convertOnlineScoreToConfidence
} from "sharedHelpers/convertScores.ts";
import { useTranslation } from "sharedHooks";

import SuggestionsResult from "./SuggestionsResult";

const AdditionalSuggestionsScroll = ( { suggestions } ) => {
  const { t } = useTranslation( );

  const onTaxonChosen = ( ) => {
    console.log( "Taxon chosen" );
  };

  const renderItem = ( { item: suggestion } ) => (
    <SuggestionsResult
      confidence={suggestion?.score
        ? convertOfflineScoreToConfidence( suggestion?.score )
        : convertOnlineScoreToConfidence( suggestion?.combined_score )}
      fetchRemote={false}
      handlePress={onTaxonChosen}
      taxon={suggestion?.taxon}
    />
  );

  return (
    <View className="mt-4 mb-7">
      <Heading3 className="mb-3">{t( "It-might-also-be" )}</Heading3>
      <View className="flex-1">
        <CustomFlashList
          horizontal
          renderItem={renderItem}
          estimatedItemSize={100}
          keyExtractor={item => item?.taxon?.id}
          data={suggestions}
        />
      </View>
    </View>
  );
};

export default AdditionalSuggestionsScroll;
