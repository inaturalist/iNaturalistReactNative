import { CommonActions } from "@react-navigation/native";

// creates a navigation tree that navigates to the AI camera
export default function camera( navigation ) {
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
                name: "Camera",
                params: {
                  camera: "AI"
                }
              }
            ]
          }
        }
      ]
    } )
  );
}
