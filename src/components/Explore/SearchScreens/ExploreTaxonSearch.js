// @flow

import { useNavigation } from "@react-navigation/native";
import fetchSearchResults from "api/search";
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
import Taxon from "realmModels/Taxon";
import { useAuthenticatedQuery } from "sharedHooks";

const ExploreTaxonSearch = ( ): Node => {
  const [taxonQuery, setTaxonQuery] = useState( "" );
  const navigation = useNavigation( );

  // TODO: this exactly the same as in src/components/Suggestions/TaxonSearch.js, so we should
  // probably move it to a shared hook
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

  const onTaxonSelected = useCallback( async newTaxon => {
    navigation.navigate( "Explore", { taxon: newTaxon } );
  }, [navigation] );

  const renderFooter = ( ) => (
    <View className="pb-10" />
  );

  const renderItem = useCallback( ( { item: taxon, index } ) => (
    <TaxonResult
      taxon={taxon}
      showCheckmark={false}
      handlePress={() => onTaxonSelected( taxon )}
      testID={`Search.taxa.${taxon.id}`}
      first={index === 0}
    />
  ), [onTaxonSelected] );

  return (
    <ViewWrapper className="flex-1">
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

export default ExploreTaxonSearch;
