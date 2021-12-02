// @flow

import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HeaderBackButton } from "@react-navigation/elements";

import ObsList from "../components/Observations/ObsList";
import ObsDetails from "../components/ObsDetails/ObsDetails";
import UserProfile from "../components/UserProfile/UserProfile";
import TaxonDetails from "../components/TaxonDetails/TaxonDetails";
import MessagesIcon from "../components/Observations/MessagesIcon";
import ObservationProvider from "../providers/ObservationProvider";

const Stack = createNativeStackNavigator( );

const screenOptions = {
  headerShown: true
};

const showBackButton = ( { navigation } ) => ( {
  headerLeft: ( ) => <HeaderBackButton onPress={( ) => navigation.goBack( )} />
} );

const App = ( ): React.Node => (
  // TODO: decide whether ObservationProvider needs to wrap both ObsList and ObsDetail
  // or whether we should simply pass the uuid through navigation params
  <ObservationProvider>
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
        <Stack.Screen
          name="TaxonDetails"
          component={TaxonDetails}
          options={showBackButton}
        />
    </Stack.Navigator>
  </ObservationProvider>
);

export default App;
