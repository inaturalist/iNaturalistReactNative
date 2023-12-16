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

import AddCommentPrompt from "./AddCommentPrompt";
import CommentBox from "./CommentBox";
import useTaxonSearch from "./hooks/useTaxonSearch";
import useTaxonSelected from "./hooks/useTaxonSelected";

const TaxonSearch = ( ): Node => {
  const [taxonQuery, setTaxonQuery] = useState( "" );
  const [selectedTaxon, setSelectedTaxon] = useState( null );
  const taxonList = useTaxonSearch( taxonQuery );

  useTaxonSelected( selectedTaxon, { vision: false } );

  const renderFooter = useCallback( ( ) => <View className="pb-10" />, [] );

  const renderTaxonResult = useCallback( ( { item: taxon, index } ) => (
    <TaxonResult
      taxon={taxon}
      handleCheckmarkPress={() => setSelectedTaxon( taxon )}
      testID={`Search.taxa.${taxon.id}`}
      first={index === 0}
      fetchRemote={false}
    />
  ), [setSelectedTaxon] );

  return (
    <ViewWrapper>
      <AddCommentPrompt />
      <CommentBox />
      <SearchBar
        handleTextChange={setTaxonQuery}
        value={taxonQuery}
        testID="SearchTaxon"
        containerClass="my-5 mx-4"
      />
      <FlatList
        keyboardShouldPersistTaps="always"
        data={taxonList}
        renderItem={renderTaxonResult}
        keyExtractor={item => item.id}
        ListFooterComponent={renderFooter}
      />
    </ViewWrapper>
  );
};

export default TaxonSearch;
