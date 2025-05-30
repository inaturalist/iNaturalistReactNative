import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import useStore from "stores/useStore";

const useNavigateWithTaxonSelected = (
  // Navigation happens when a taxon was selected
  selectedTaxon: object | null | undefined,
  // After navigation we need to unselect the taxon so we don't have
  // mysterious background nonsense happening after this screen loses focus
  unselectTaxon: Function,
  options: {
    vision: boolean
  }
) => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { entryScreen, lastScreen } = params || {};
  const currentObservation = useStore( state => state.currentObservation );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const vision = options?.vision;

  useEffect( ( ) => {
    if ( selectedTaxon === null ) { return; }

    if ( selectedTaxon === undefined ) {
      updateObservationKeys( {
        owners_identification_from_vision: false,
        taxon: selectedTaxon
      } );
    } else {
      updateObservationKeys( {
        owners_identification_from_vision: vision,
        taxon: selectedTaxon
      } );
    }

    // checking for previous screen here rather than a synced/unsynced observation
    // because a user can arrive on Suggestions/TaxonSearch
    // in two different ways from ObsDetails -> they can land directly on the Suggestions
    // screen (by adding an id) or they can first land on ObsEdit (by tapping the edit button)
    if ( lastScreen === "ObsDetails" ) {
      navigation.navigate( "ObsDetails", {
        uuid: currentObservation?.uuid,
        identTaxonId: selectedTaxon?.id,
        identTaxonFromVision: options?.vision,
        identAt: Date.now()
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
    currentObservation?.uuid,
    entryScreen,
    lastScreen,
    navigation,
    options?.vision,
    selectedTaxon,
    unselectTaxon,
    updateObservationKeys,
    vision
  ] );
};

export default useNavigateWithTaxonSelected;
