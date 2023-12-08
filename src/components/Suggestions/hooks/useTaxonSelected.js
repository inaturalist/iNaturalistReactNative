// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import Identification from "realmModels/Identification";
import useStore from "stores/useStore";

const useTaxonSelected = ( selectedTaxon: ?Object, options: Object ) => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { lastScreen } = params;
  const currentObservation = useStore( state => state.currentObservation );
  const comment = useStore( state => state.comment );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const vision = options?.vision;

  useEffect( ( ) => {
    if ( !selectedTaxon ) { return; }

    const newIdentification = Identification.new( {
      taxon: selectedTaxon,
      body: comment
    } );

    // checking for previous screen here rather than a synced/unsynced observation
    // because a user can arrive on Suggestions/TaxonSearch
    // in two different ways from ObsDetails -> they can land directly on the Suggestions
    // screen (by adding an id) or they can first land on ObsEdit (by tapping the edit button)
    if ( lastScreen === "ObsDetails" ) {
      navigation.navigate( "ObsDetails", {
        uuid: currentObservation.uuid,
        taxonSuggested: newIdentification.taxon,
        comment,
        vision
      } );
    } else {
      updateObservationKeys( {
        owners_identification_from_vision: vision,
        taxon: newIdentification.taxon
      } );
    }
  }, [
    comment,
    currentObservation,
    lastScreen,
    navigation,
    selectedTaxon,
    updateObservationKeys,
    vision
  ] );

  useEffect( ( ) => {
    if ( !selectedTaxon ) { return; }
    if ( currentObservation?.taxon?.id !== selectedTaxon.id ) { return; }
    if ( vision ) {
      navigation.goBack( );
    } else {
      navigation.navigate( "ObsEdit" );
    }
  }, [
    currentObservation,
    navigation,
    vision,
    selectedTaxon
  ] );
};

export default useTaxonSelected;
