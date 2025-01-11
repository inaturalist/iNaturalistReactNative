import { Body1, CustomFlashList, Heading3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

import SuggestionsResult from "./SuggestionsResult";

const AdditionalSuggestionsScroll = ( { suggestions, onTaxonChosen } ) => {
  const { t } = useTranslation( );

  const renderItem = ( { item: suggestion } ) => (
    <SuggestionsResult
      confidence={suggestion?.score
        ? Math.round( suggestion.score )
        : Math.round( suggestion.combined_score )}
      fetchRemote={false}
      handlePress={onTaxonChosen}
      taxon={suggestion?.taxon}
    />
  );

  const renderEmptyComponent = ( ) => (
    <Body1>
      {t( "iNaturalist-has-no-ID-suggestions-for-this-photo" )}
    </Body1>
  );

  return (
    <View className="mt-4 mb-7">
      <Heading3 className="mb-3">{t( "It-might-also-be" )}</Heading3>
      <View className="h-36">
        {suggestions.length === 0
        // using this instead of ListEmptyComponent because
        // horizontal list will not fully render if it's empty
          ? renderEmptyComponent( )
          : (
            <CustomFlashList
              horizontal
              renderItem={renderItem}
              estimatedItemSize={160}
              keyExtractor={item => item?.taxon?.id}
              data={suggestions}
            />
          )}
      </View>
    </View>
  );
};

export default AdditionalSuggestionsScroll;
