import type { ParamListBase } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RealmObservation } from "realmModels/types";
import useStore from "stores/useStore";

function useNavigateToObsEdit() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const prepareObsEdit = useStore( state => state.prepareObsEdit );
  const setMyObsOffsetToRestore = useStore( state => state.setMyObsOffsetToRestore );

  function navigateToObsEdit( localObservation: RealmObservation ) {
    prepareObsEdit( localObservation );
    navigation.navigate( "ObsEdit" );
    setMyObsOffsetToRestore();
  }

  return navigateToObsEdit;
}

export default useNavigateToObsEdit;
