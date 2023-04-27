// @flow

import fetchSearchResults from "api/search";
import {
  SearchBar
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { FlatList } from "react-native";
import Taxon from "realmModels/Taxon";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

import TaxonResult from "./TaxonResult";

type Props = {
  route: Object,
  createId: Function
};

const TaxonSearch = ( {
  route,
  createId
}: Props ): Node => {
  const [taxonSearch, setTaxonSearch] = useState( "" );
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

  useEffect( ( ) => {
    // this clears search whenever a user is coming from ObsEdit
    // but maintains current search when a user navigates to TaxonDetails and back
    if ( route?.params?.clearSearch ) {
      setTaxonSearch( "" );
    }
  }, [route] );

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
        renderItem={( { item } ) => <TaxonResult item={item} createId={createId} />}
        keyExtractor={item => item.id}
      />
    </>
  );
};

export default TaxonSearch;
