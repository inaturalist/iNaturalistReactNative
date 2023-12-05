// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import fetchSearchResults from "api/search";
import {
  SearchBar,
  TaxonResult,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback, useContext, useState
} from "react";
import { FlatList } from "react-native";
import Taxon from "realmModels/Taxon";
import { useAuthenticatedQuery } from "sharedHooks";

import AddCommentPrompt from "./AddCommentPrompt";
import CommentBox from "./CommentBox";

const TaxonSearch = ( ): Node => {
  const { params } = useRoute( );
  const obsUUID = params?.obsUUID;

  const {
    createId,
    comment,
    setComment,
    currentObservation,
    updateObservationKeys
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

  const onTaxonSelected = useCallback( async taxon => {
    if ( !obsUUID ) {
      // Called from observation editor screen
      createId( taxon );
      updateObservationKeys( {
        observation: {
          ...currentObservation,
          owners_identification_from_vision: false
        }
      } );
      navigation.navigate( "ObsEdit" );
    } else {
      // Called when adding an identification to someone else's observation
      navigation.navigate( "ObsDetails", { uuid: obsUUID, taxonSuggested: taxon } );
    }
  }, [createId, navigation, obsUUID, currentObservation, updateObservationKeys] );

  const renderFooter = ( ) => (
    <View className="pb-10" />
  );

  const renderItem = useCallback( ( { item: taxon, index } ) => (
    <TaxonResult
      taxon={taxon}
      handleCheckmarkPress={() => onTaxonSelected( taxon )}
      testID={`Search.taxa.${taxon.id}`}
      first={index === 0}
    />
  ), [onTaxonSelected] );

  return (
    <ViewWrapper className="flex-1">
      <AddCommentPrompt
        setComment={setComment}
        currentObservation={currentObservation}
      />
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
