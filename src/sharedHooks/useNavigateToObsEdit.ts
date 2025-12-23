import { CommonActions, useNavigation } from "@react-navigation/native";
import type { RealmObservation } from "realmModels/types";
import useStore from "stores/useStore";

function useNavigateToObsEdit() {
  const navigation = useNavigation( );
  const prepareObsEdit = useStore( state => state.prepareObsEdit );
  const setMyObsOffsetToRestore = useStore( state => state.setMyObsOffsetToRestore );

  function navigateToObsEdit( localObservation: RealmObservation ) {
    prepareObsEdit( localObservation );
    // since we can access ObsEdit from two separate stacks, the TabStackNavigator
    // and the NoBottomTabStackNavigator, we don't want ObsEdit to land on the previous
    // history of the NoBottomTabStackNavigator (i.e. anything from the ObsCreate flow)
    // when we're navigating via the TabStack (i.e. MyObservations, ObsDetails)
    navigation.dispatch(
      CommonActions.reset( {
        index: 0,
        routes: [
          {
            name: "NoBottomTabStackNavigator",
            state: {
              index: 0,
              routes: [
                {
                  name: "ObsEdit",
                },
              ],
            },
          },
        ],
      } ),
    );
    setMyObsOffsetToRestore();
  }

  return navigateToObsEdit;
}

export default useNavigateToObsEdit;
