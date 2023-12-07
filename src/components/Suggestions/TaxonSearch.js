// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
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
import Identification from "realmModels/Identification";
import Taxon from "realmModels/Taxon";
import { useAuthenticatedQuery } from "sharedHooks";
import useStore from "stores/useStore";

import AddCommentPrompt from "./AddCommentPrompt";
import CommentBox from "./CommentBox";

const TaxonSearch = ( ): Node => {
  const { params } = useRoute( );
  const obsUUID = params?.obsUUID;
  const [taxonQuery, setTaxonQuery] = useState( "" );
  const navigation = useNavigation( );
  const currentObservation = useStore( state => state.currentObservation );
  const comment = useStore( state => state.comment );
  const observations = useStore( state => state.observations );
  const currentObservationIndex = useStore( state => state.currentObservationIndex );
  const updateObservations = useStore( state => state.updateObservations );

  const updateObservationKeys = useCallback( keysAndValues => {
    const updatedObservations = observations;
    const updatedObservation = {
      ...( currentObservation.toJSON
        ? currentObservation.toJSON( )
        : currentObservation ),
      ...keysAndValues
    };
    updatedObservations[currentObservationIndex] = updatedObservation;
    updateObservations( [...updatedObservations] );
  }, [
    currentObservation,
    currentObservationIndex,
    observations,
    updateObservations
  ] );

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
    if ( !obsUUID ) {
      // Called from observation editor screen
      const newIdentification = Identification.new( {
        taxon: newTaxon,
        body: comment
      } );
      updateObservationKeys( {
        owners_identification_from_vision: false,
        taxon: newIdentification.taxon
      } );
      navigation.navigate( "ObsEdit" );
    } else {
      // Called when adding an identification to someone else's observation
      navigation.navigate( "ObsDetails", { uuid: obsUUID, taxonSuggested: newTaxon, comment } );
    }
  }, [navigation, obsUUID, updateObservationKeys, comment] );

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
