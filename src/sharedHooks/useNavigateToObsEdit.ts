import type { ParamListBase } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ApiTaxon } from "api/types";
import type { RealmObservation, RealmTaxon } from "realmModels/types";
import useStore from "stores/useStore";

function useNavigateToObsEdit() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const prepareObsEdit = useStore( state => state.prepareObsEdit );
  const setMyObsOffsetToRestore = useStore( state => state.setMyObsOffsetToRestore );

  function navigateToObsEdit(
    localObservation: RealmObservation,
    lastScreen?: string,
    taxon?: ApiTaxon | RealmTaxon,
  ) {
    prepareObsEdit( { ...localObservation, taxon } );
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
