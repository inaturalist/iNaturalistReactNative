import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTaxon } from "sharedHooks";
import useStore from "stores/useStore";

import Match from "./Match";

const MatchContainer = ( ) => {
  const currentObservation = useStore( state => state.currentObservation );
  const matchScreenSuggestion = useStore( state => state.matchScreenSuggestion );
  const navigation = useNavigation( );

  const { taxon } = useTaxon( matchScreenSuggestion?.taxon );

  console.log( taxon?.taxonPhotos?.[0], "taxon photos" );

  const navToTaxonDetails = ( ) => {
    navigation.push( "TaxonDetails", {
      id: taxon?.id,
      hideNavButtons: true
    } );
  };

  const handleSaveOrDiscardPress = action => {
    console.log( action, "action" );
  };

  const confidence = matchScreenSuggestion
    ? Math.round( matchScreenSuggestion.score * 100 )
    : null;

  return (
    <Match
      observation={currentObservation}
      handleSaveOrDiscardPress={handleSaveOrDiscardPress}
      navToTaxonDetails={navToTaxonDetails}
      taxon={taxon}
      confidence={confidence}
    />
  );
};

export default MatchContainer;
