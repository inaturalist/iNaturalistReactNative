// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";

import ObsDetails from "../components/ObsDetails/ObsDetails";
import AddID from "../components/ObsEdit/AddID";
import ObsList from "../components/Observations/ObsList";
import Mortal from "../components/SharedComponents/Mortal";
import TaxonDetails from "../components/TaxonDetails/TaxonDetails";
import UserProfile from "../components/UserProfile/UserProfile";

const Stack = createNativeStackNavigator( );

const screenOptions = {
  headerShown: true
};

const showBackButton = ( { navigation } ) => ( {
  headerLeft: ( ) => <HeaderBackButton onPress={( ) => navigation.goBack( )} />
} );

const hideHeader = {
  headerShown: false
};

const MyObservationsStackNavigation = ( ): React.Node => (
  <Mortal>
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ObsList"
        component={ObsList}
        options={hideHeader}
      />
      <Stack.Screen
        name="ObsDetails"
        component={ObsDetails}
        options={hideHeader}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfile}
        options={hideHeader}
      />
      <Stack.Screen
        name="TaxonDetails"
        component={TaxonDetails}
        options={showBackButton}
      />
      <Stack.Screen
        name="AddID"
        component={AddID}
        options={hideHeader}
      />
    </Stack.Navigator>
  </Mortal>
);

export default MyObservationsStackNavigation;
