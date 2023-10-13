// @flow

import { useNavigation } from "@react-navigation/native";
import fetchSearchResults from "api/search";
import {
  SearchBar,
  TaxonResult,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useEffect, useState } from "react";
import { FlatList } from "react-native";
import Taxon from "realmModels/Taxon";
import { useAuthenticatedQuery } from "sharedHooks";

import AddCommentPrompt from "./AddCommentPrompt";
import CommentBox from "./CommentBox";

const TaxonSearch = ( ): Node => {
  const {
    createId,
    comment
  } = useContext( ObsEditContext );
  const [taxonQuery, setTaxonQuery] = useState( "" );
  const navigation = useNavigation( );
  const { data: taxonList } = useAuthenticatedQuery(
    ["fetchSearchResults", taxonQuery],
    optsWithAuth => fetchSearchResults(
      {
        q: taxonQuery,
        sources: "taxa",
        fields: {
          taxon: Taxon.TAXON_FIELDS
        }
      },
      optsWithAuth
    )
  );

  useEffect(
    ( ) => {
      navigation.addListener( "blur", ( ) => {
        setTaxonQuery( "" );
      } );
    },
    [navigation]
  );

  const renderFooter = ( ) => (
    <View className="pb-10" />
  );

  return (
    <ViewWrapper className="flex-1">
      <AddCommentPrompt />
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
        renderItem={( { item, index } ) => (
          <TaxonResult
            taxon={item}
            handleCheckmarkPress={( ) => createId( item )}
            testID={`Search.taxa.${item.id}`}
            first={index === 0}
          />
        )}
        keyExtractor={item => item.id}
        ListFooterComponent={renderFooter}
      />
    </ViewWrapper>
  );
};

export default TaxonSearch;
