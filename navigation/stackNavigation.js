import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ObservationsList from "../components/Observations/ObservationsList";

const Stack = createNativeStackNavigator( );

const App = ( ) => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="ObservationsList" component={ObservationsList} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;

