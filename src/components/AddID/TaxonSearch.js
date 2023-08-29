// @flow

import fetchSearchResults from "api/search";
import {
  Body2,
  SearchBar,
  TaxonResult
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { FlatList } from "react-native";
import Taxon from "realmModels/Taxon";
import { useTranslation } from "sharedHooks";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

type Props = {
  taxonSearch: string,
  setTaxonSearch: Function,
  createId: Function
};

const TaxonSearch = ( {
  taxonSearch,
  setTaxonSearch,
  createId
}: Props ): Node => {
  const { t } = useTranslation( );
  const { data: taxonList } = useAuthenticatedQuery(
    ["fetchSearchResults", taxonSearch],
    optsWithAuth => fetchSearchResults(
      {
        q: taxonSearch,
        sources: "taxa",
        fields: {
          taxon: Taxon.TAXON_FIELDS
        }
      },
      optsWithAuth
    )
  );

  const renderEmptyComponent = ( ) => (
    <Body2 className="self-center">
      {t( "Search-for-a-taxon-to-add-an-identification" )}
    </Body2>
  );

  return (
    <>
      <View className="mx-6">
        <SearchBar
          handleTextChange={setTaxonSearch}
          value={taxonSearch}
          testID="SearchTaxon"
          containerClass="pb-5 mt-3"
        />
      </View>
      <FlatList
        keyboardShouldPersistTaps="always"
        data={taxonList}
        renderItem={( { item } ) => (
          <TaxonResult
            taxon={item}
            handleCheckmarkPress={( ) => createId( item )}
            testID={`Search.taxa.${item.id}`}
          />
        )}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyComponent}
      />
    </>
  );
};

export default TaxonSearch;
