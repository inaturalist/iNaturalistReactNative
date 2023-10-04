// @flow

import { useNavigation } from "@react-navigation/native";
import fetchSearchResults from "api/search";
import {
  SearchBar,
  TaxonResult
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { FlatList } from "react-native";
import Taxon from "realmModels/Taxon";
import { useAuthenticatedQuery } from "sharedHooks";

type Props = {
  onTaxonChosen: Function
};

const TaxonSearch = ( {
  onTaxonChosen
}: Props ): Node => {
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
    <View className="flex-1">
      <SearchBar
        handleTextChange={setTaxonQuery}
        value={taxonQuery}
        testID="SearchTaxon"
        containerClass="pb-5 mx-4"
      />
      <FlatList
        keyboardShouldPersistTaps="always"
        data={taxonList}
        renderItem={( { item, index } ) => (
          <TaxonResult
            taxon={item}
            handleCheckmarkPress={( ) => onTaxonChosen( item )}
            testID={`Search.taxa.${item.id}`}
            first={index === 0}
          />
        )}
        keyExtractor={item => item.id}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

export default TaxonSearch;
