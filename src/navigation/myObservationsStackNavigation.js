// @flow

import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HeaderBackButton } from "@react-navigation/elements";

import ObsList from "../components/Observations/ObsList";
import ObsDetails from "../components/ObsDetails/ObsDetails";
import UserProfile from "../components/UserProfile/UserProfile";
import TaxonDetails from "../components/TaxonDetails/TaxonDetails";
import Mortal from "../components/SharedComponents/Mortal";
import SuggestID from "../components/ObsEdit/SuggestID";

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
        name="SuggestID"
        component={SuggestID}
        options={hideHeader}
      />
    </Stack.Navigator>
  </Mortal>
);

export default MyObservationsStackNavigation;
