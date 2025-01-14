import calculateConfidence from "components/Match/calculateConfidence";
import { CustomFlashList, Heading3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

import SuggestionsResult from "./SuggestionsResult";

const AdditionalSuggestionsScroll = ( { otherSuggestions, onTaxonChosen } ) => {
  const { t } = useTranslation( );

  const renderItem = ( { item: suggestion } ) => (
    <SuggestionsResult
      confidence={calculateConfidence( suggestion )}
      fetchRemote={false}
      handlePress={onTaxonChosen}
      taxon={suggestion?.taxon}
    />
  );

  if ( otherSuggestions?.length === 0 ) {
    return null;
  }

  return (
    <View className="mt-4 mb-7">
      <Heading3 className="mb-3">{t( "It-might-also-be" )}</Heading3>
      <View className="h-36">
        <CustomFlashList
          horizontal
          renderItem={renderItem}
          estimatedItemSize={160}
          keyExtractor={item => item?.taxon?.id}
          data={otherSuggestions}
        />
      </View>
    </View>
  );
};

export default AdditionalSuggestionsScroll;
