// @flow

import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HeaderBackButton } from "@react-navigation/elements";

import ObsList from "../components/Observations/ObsList";
import ObsDetails from "../components/ObsDetails/ObsDetails";
import UserProfile from "../components/UserProfile/UserProfile";
import MessagesIcon from "../components/Observations/MessagesIcon";

const Stack = createNativeStackNavigator( );

const screenOptions = {
  headerShown: true
};

const showBackButton = ( { navigation } ) => ( {
  headerLeft: ( ) => <HeaderBackButton onPress={( ) => navigation.goBack( )} />
} );

const App = ( ): React.Node => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="ObsList"
      component={ObsList}
      options={( { navigation } ) => ( {
        headerRight: ( ) => <MessagesIcon />
      } )}
    />
    <Stack.Screen
      name="ObsDetails"
      component={ObsDetails}
      options={showBackButton}
      />
    <Stack.Screen
      name="UserProfile"
      component={UserProfile}
      options={showBackButton}
    />
  </Stack.Navigator>
);

export default App;
