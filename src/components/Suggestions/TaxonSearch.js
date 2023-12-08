// @flow

import {
  SearchBar,
  TaxonResult,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useState
} from "react";
import { FlatList } from "react-native";
import useStore from "stores/useStore";

import AddCommentPrompt from "./AddCommentPrompt";
import CommentBox from "./CommentBox";
import useTaxonSearch from "./hooks/useTaxonSearch";
import useTaxonSelected from "./hooks/useTaxonSelected";

const TaxonSearch = ( ): Node => {
  const [taxonQuery, setTaxonQuery] = useState( "" );
  const currentObservation = useStore( state => state.currentObservation );
  const comment = useStore( state => state.comment );
  const synced = currentObservation.wasSynced !== undefined
    && currentObservation.wasSynced( );
  const [selectedTaxon, setSelectedTaxon] = useState( null );

  const taxonList = useTaxonSearch( taxonQuery );

  useTaxonSelected( selectedTaxon, { vision: false } );

  const renderFooter = ( ) => <View className="pb-10" />;

  const renderItem = useCallback( ( { item: taxon, index } ) => (
    <TaxonResult
      taxon={taxon}
      handleCheckmarkPress={() => setSelectedTaxon( taxon )}
      testID={`Search.taxa.${taxon.id}`}
      first={index === 0}
    />
  ), [setSelectedTaxon] );

  return (
    <ViewWrapper>
      <AddCommentPrompt synced={synced} />
      <CommentBox comment={comment} />
      <SearchBar
        handleTextChange={setTaxonQuery}
        value={taxonQuery}
        testID="SearchTaxon"
        containerClass="my-5 mx-4"
      />
      <FlatList
        keyboardShouldPersistTaps="always"
        data={taxonList}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListFooterComponent={renderFooter}
      />
    </ViewWrapper>
  );
};

export default TaxonSearch;
