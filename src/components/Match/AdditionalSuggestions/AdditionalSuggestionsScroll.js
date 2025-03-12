import calculateConfidence from "components/Match/calculateConfidence";
import { ActivityIndicator, CustomFlashList, Heading3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, {
  useCallback, useEffect, useRef, useState
} from "react";
import { useTranslation } from "sharedHooks";

import SuggestionsResult from "./SuggestionsResult";

const AdditionalSuggestionsScroll = ( {
  otherSuggestions,
  suggestionsLoading,
  onSuggestionChosen
} ) => {
  const { t } = useTranslation( );
  const [maxHeight, setMaxHeight] = useState( 0 );
  const [isVisible, setIsVisible] = useState( false );

  // We're using an extra measuring container to check the heights of every item,
  // even the ones that would otherwise be offscreen
  const measuredItemsRef = useRef( new Set() );
  const suggestionsRef = useRef( [] );

  useEffect( () => {
    suggestionsRef.current = otherSuggestions || [];
  }, [otherSuggestions] );

  useEffect( () => {
    // reset when suggestions changes (like, when suggestion is pressed or location added)
    setMaxHeight( 0 );
    setIsVisible( false );
    measuredItemsRef.current = new Set();
  }, [otherSuggestions] );

  const updateMaxHeight = useCallback( ( height, itemId ) => {
    if ( !itemId || height <= 0 ) return;

    // track each item as measured
    measuredItemsRef.current.add( itemId );

    // find tallest max height (i.e. longest common name)
    setMaxHeight( current => Math.max( current, height ) );

    const allSuggestions = suggestionsRef.current;
    const allItemIds = new Set( allSuggestions.map( s => s?.taxon?.id ) );
    const allMeasured = Array.from( allItemIds ).every( id => measuredItemsRef.current.has( id ) );

    // Make visible when all items in the renderMeasuringContainer are measured
    if ( allMeasured && allItemIds.size > 0 ) {
      setIsVisible( true );
    }
  }, [] );

  const handleSuggestionPress = useCallback( suggestion => {
    onSuggestionChosen( suggestion );
  }, [onSuggestionChosen] );

  const renderMeasuringContainer = () => {
    if ( isVisible ) return null;

    const measuringContainerStyle = {
      position: "absolute", opacity: 0, left: -9999, flexDirection: "row"
    };

    const resultStyle = { marginRight: 14 };

    return (
      <View style={measuringContainerStyle}>
        {( otherSuggestions || [] ).map( suggestion => {
          const taxonId = suggestion?.taxon?.id;
          const confidence = calculateConfidence( suggestion );

          return (
            <View key={`measuring-wrapper-${taxonId}`} style={resultStyle}>
              <SuggestionsResult
                key={`measuring-${taxonId}`}
                confidence={confidence}
                handlePress={undefined}
                taxon={suggestion?.taxon}
                updateMaxHeight={height => updateMaxHeight( height, taxonId )}
                forcedHeight={0} // we don't want a forced height during measurement
              />
            </View>
          );
        } )}
      </View>
    );
  };

  const renderItem = ( { item: suggestion } ) => {
    const confidence = calculateConfidence( suggestion );

    return (
      <SuggestionsResult
        confidence={confidence}
        handlePress={( ) => handleSuggestionPress( suggestion )}
        taxon={suggestion?.taxon}
        updateMaxHeight={undefined}
        forcedHeight={maxHeight}
      />
    );
  };

  if ( !suggestionsLoading && otherSuggestions?.length === 0 ) {
    return null;
  }

  const renderHeader = () => <View className="ml-5" />;

  const keepHiddenUntilCardHeightsMeasured = {
    opacity: isVisible
      ? 1
      : 0.05
  };

  return (
    <View className="mt-4 mb-7">
      <Heading3 className="mx-5 mb-3">{t( "It-might-also-be" )}</Heading3>

      {!suggestionsLoading
        ? (
          <>
            {renderMeasuringContainer( )}
            <View style={keepHiddenUntilCardHeightsMeasured}>
              <CustomFlashList
                ListHeaderComponent={renderHeader}
                horizontal
                renderItem={renderItem}
                estimatedItemSize={160}
                keyExtractor={item => item?.taxon?.id}
                data={otherSuggestions}
              />
            </View>
          </>
        )
        : <ActivityIndicator className="my-3" size={40} />}
    </View>
  );
};

export default AdditionalSuggestionsScroll;
