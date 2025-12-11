import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";

// Creates a navigation tree that navigates to the ObsDetails screen with a specific obs UUID,
// and when navigating back from the ObsDetails screen, it'll go back to ObsList screen
export default function navigateToObsDetails(
  navigation: NavigationProp<ParamListBase>,
  uuid: string
): void {
  navigation.dispatch(
    CommonActions.reset( {
      index: 1,
      routes: [
        {
          name: "TabNavigator",
          state: {
            routes: [
              {
                name: "ObservationsTab",
                state: {
                  index: 0,
                  routes: [
                    { name: "ObsList" },
                    {
                      name: "ObsDetails",
                      params: { uuid }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    } )
  );
}
