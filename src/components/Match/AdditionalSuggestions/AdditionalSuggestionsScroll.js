import calculateConfidence from "components/Match/calculateConfidence";
import { CustomFlashList, Heading3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback, useState } from "react";
import { useTranslation } from "sharedHooks";

import SuggestionsResult from "./SuggestionsResult";

const AdditionalSuggestionsScroll = ( { otherSuggestions, onSuggestionChosen } ) => {
  const { t } = useTranslation( );
  const [maxHeight, setMaxHeight] = useState( 0 );

  // we want to update the height of each item to be uniform,
  // so if we layout an item with a larger height, we'll change the height
  const handleLayout = useCallback( event => {
    const height = Math.ceil( event.nativeEvent.layout.height );
    // Only update if the new height is larger than previous height
    setMaxHeight( current => ( height > current
      ? height
      : current ) );
  }, [] );

  const renderItem = ( { item: suggestion } ) => {
    const confidence = calculateConfidence( suggestion );

    const handlePress = ( ) => onSuggestionChosen( suggestion );

    return (
      <SuggestionsResult
        confidence={confidence}
        fetchRemote={false}
        handlePress={handlePress}
        taxon={suggestion?.taxon}
        onLayoutHeight={handleLayout}
        forcedHeight={maxHeight}
      />
    );
  };

  if ( otherSuggestions?.length === 0 ) {
    return null;
  }

  return (
    <View className="mt-4 mb-7">
      <Heading3 className="mb-3">{t( "It-might-also-be" )}</Heading3>
      <CustomFlashList
        horizontal
        renderItem={renderItem}
        estimatedItemSize={160}
        keyExtractor={item => item?.taxon?.id}
        data={otherSuggestions}
      />
    </View>
  );
};

export default AdditionalSuggestionsScroll;
