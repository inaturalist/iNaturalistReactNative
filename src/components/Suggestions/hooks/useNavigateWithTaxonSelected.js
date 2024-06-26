// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import useStore from "stores/useStore";

const useNavigateWithTaxonSelected = (
  // Navgiation happens when a taxon was selected
  selectedTaxon: ?Object,
  // After navigation we need to unselect the taxon so we don't have
  // mysterious background nonsense happening after this screen loses focus
  unselectTaxon: Function,
  options: Object
) => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { lastScreen } = params;
  const currentObservation = useStore( state => state.currentObservation );
  const comment = useStore( state => state.comment );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const vision = options?.vision;

  // console.log( vision, selectedTaxon, "vision and selected taxon", currentObservation );

  useEffect( ( ) => {
    if ( !selectedTaxon ) { return; }

    updateObservationKeys( {
      owners_identification_from_vision: vision,
      taxon: selectedTaxon,
      description: comment
    } );

    // checking for previous screen here rather than a synced/unsynced observation
    // because a user can arrive on Suggestions/TaxonSearch
    // in two different ways from ObsDetails -> they can land directly on the Suggestions
    // screen (by adding an id) or they can first land on ObsEdit (by tapping the edit button)
    if ( lastScreen === "ObsDetails" ) {
      navigation.navigate( "ObsDetails", {
        uuid: currentObservation?.uuid,
        suggestedTaxonId: selectedTaxon.id
      } );
    } else if ( lastScreen === "ObsEdit" ) {
      navigation.goBack( );
    } else {
      navigation.navigate( "ObsEdit", { lastScreen: "Suggestions" } );
    }
    // If we've navigated, there's no need to run this effect again
    unselectTaxon( );
  }, [
    comment,
    currentObservation?.uuid,
    lastScreen,
    navigation,
    selectedTaxon,
    unselectTaxon,
    updateObservationKeys,
    vision
  ] );
};

export default useNavigateWithTaxonSelected;
