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
  const { entryScreen } = params;
  const currentObservation = useStore( state => state.currentObservation );
  const comment = useStore( state => state.comment );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const vision = options?.vision;

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
    if ( entryScreen === "ObsDetails" ) {
      navigation.navigate( "ObsDetails", {
        uuid: currentObservation?.uuid,
        suggestedTaxon: {
          id: selectedTaxon.id,
          default_photo: selectedTaxon.default_photo,
          rank: selectedTaxon.rank,
          rank_level: selectedTaxon.rank_level,
          preferred_common_name: selectedTaxon.preferred_common_name,
          name: selectedTaxon.name
        }
      } );
    } else if ( entryScreen === "ObsEdit" ) {
      // Cant' go back b/c we might be on Suggestions OR TaxonSearch. Don't
      // want to set lastScreen b/c we don't want to go back to suggestions
      navigation.navigate( "ObsEdit" );
    } else {
      navigation.navigate( "ObsEdit", { lastScreen: "Suggestions" } );
    }

    // If we've navigated, there's no need to run this effect again
    unselectTaxon( );
  }, [
    comment,
    currentObservation?.uuid,
    entryScreen,
    navigation,
    selectedTaxon,
    unselectTaxon,
    updateObservationKeys,
    vision
  ] );
};

export default useNavigateWithTaxonSelected;
