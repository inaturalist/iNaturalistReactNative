import { useNavigation } from "@react-navigation/native";
import type { ApiTaxon } from "api/types";
import type { TabStackScreenProps } from "navigation/types";
import type { RealmObservation, RealmTaxon } from "realmModels/types";
import useStore from "stores/useStore";

function useNavigateToObsEdit() {
  // This hook is used in
  // MyObservationsContainer
  // ObsDetailsDefaultModeHeaderRight
  // ObservationsFlashList
  // HeaderEditIcon
  const navigation = useNavigation<TabStackScreenProps<
  "ObsList" | "ObsDetails" | "RootExplore" | "Explore" | "Match"
  >["navigation"]>( );
  const prepareObsEdit = useStore( state => state.prepareObsEdit );
  const setMyObsOffsetToRestore = useStore( state => state.setMyObsOffsetToRestore );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );

  function navigateToObsEdit(
    localObservation: RealmObservation,
    lastScreen?: "Match",
    taxon?: ApiTaxon | RealmTaxon,
  ) {
    prepareObsEdit( localObservation );
    if ( taxon ) {
      updateObservationKeys( {
        owners_identification_from_vision: true,
        taxon,
      } );
    }
    navigation.navigate(
      "ObsEdit",
      lastScreen
        ? { lastScreen }
        : undefined,
    );
    setMyObsOffsetToRestore();
  }

  return navigateToObsEdit;
}

export default useNavigateToObsEdit;
