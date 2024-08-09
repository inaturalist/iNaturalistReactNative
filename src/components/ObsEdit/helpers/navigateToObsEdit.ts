import { CommonActions } from "@react-navigation/native";

const navigateToObsEdit = navigation => {
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
                name: "ObsEdit"
              }
            ]
          }
        }
      ]
    } )
  );
};

export default navigateToObsEdit;
