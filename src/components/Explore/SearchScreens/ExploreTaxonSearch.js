// @flow

import {
  Heading4,
  INatIconButton,
  SearchBar,
  TaxonResult,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback, useLayoutEffect, useRef, useState
} from "react";
import { FlatList } from "react-native";
import { useIconicTaxa, useTranslation } from "sharedHooks";
import useTaxonSearch from "sharedHooks/useTaxonSearch";
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadowForColor( colors.darkGray, {
  offsetHeight: 4
} );

type Props = {
  closeModal: Function,
  updateTaxon: Function
};

const ExploreTaxonSearch = ( { closeModal, updateTaxon }: Props ): Node => {
  const { t } = useTranslation( );
  const [taxonQuery, setTaxonQuery] = useState( "" );
  // Ref for the input field
  const inputRef = useRef( null );
  // Focus input field on mount
  useLayoutEffect( ( ) => {
    inputRef.current?.focus();
  }, [] );

  const iconicTaxa = useIconicTaxa( { reload: false } );
  const taxonList = useTaxonSearch( taxonQuery );

  const onTaxonSelected = useCallback( async newTaxon => {
    updateTaxon( newTaxon );
    closeModal();
  }, [closeModal, updateTaxon] );

  const renderItem = useCallback( ( { item: taxon, index } ) => (
    <TaxonResult
      taxon={taxon}
      showCheckmark={false}
      handlePress={() => onTaxonSelected( taxon )}
      testID={`Search.taxa.${taxon.id}`}
      first={index === 0}
    />
  ), [onTaxonSelected] );

  let data = iconicTaxa;
  if ( taxonQuery.length > 0 ) {
    data = taxonList;
  }

  return (
    <ViewWrapper className="flex-1">
      <View className="flex-row justify-center p-5 bg-white">
        <INatIconButton
          testID="ExploreTaxonSearch.close"
          size={18}
          icon="back"
          className="absolute top-2 left-3 z-10"
          onPress={( ) => closeModal()}
          accessibilityLabel={t( "SEARCH-TAXA" )}
        />
        <Heading4>{t( "SEARCH-TAXA" )}</Heading4>
      </View>
      <View
        className="bg-white px-6 pt-2 pb-8"
        style={DROP_SHADOW}
      >
        <SearchBar
          handleTextChange={setTaxonQuery}
          value={taxonQuery}
          testID="SearchTaxon"
          input={inputRef}
        />
      </View>
      <FlatList
        keyboardShouldPersistTaps="always"
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </ViewWrapper>
  );
};

export default ExploreTaxonSearch;
