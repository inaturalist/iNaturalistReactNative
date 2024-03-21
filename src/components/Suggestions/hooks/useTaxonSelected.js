// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import useStore from "stores/useStore";

// TODO rename this, should be something to indicate that it handles
// navigation
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

    // checking for previous screen here rather than a synced/unsynced observation
    // because a user can arrive on Suggestions/TaxonSearch
    // in two different ways from ObsDetails -> they can land directly on the Suggestions
    // screen (by adding an id) or they can first land on ObsEdit (by tapping the edit button)
    if ( lastScreen === "ObsDetails" ) {
      navigation.navigate( "ObsDetails", {
        uuid: currentObservation?.uuid,
        // TODO refactor so we're not passing complex objects as params; all
        // obs details really needs to know is the ID of the taxon
        suggestedTaxonId: selectedTaxon.id,
        comment,
        vision
      } );
    } else {
      console.log( selectedTaxon, "selected taxon in useTaxonSelected" );
      updateObservationKeys( {
        owners_identification_from_vision: vision,
        taxon: selectedTaxon
      } );
      navigation.navigate( "ObsEdit" );
    }
  }, [
    comment,
    currentObservation?.uuid,
    lastScreen,
    navigation,
    selectedTaxon,
    updateObservationKeys,
    vision
  ] );
};

export default useTaxonSelected;
