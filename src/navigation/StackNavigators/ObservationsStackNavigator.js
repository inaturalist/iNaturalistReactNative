// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ExploreContainer from "components/Explore/ExploreContainer";
import ExploreFilterScreen from "components/Explore/ExploreFilterScreen";
import ExploreLocationSearch from "components/Explore/ExploreLocationSearch";
import ExploreTaxonSearch from "components/Explore/ExploreTaxonSearch";
import Identify from "components/Identify/Identify";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer";
import DQAContainer from "components/ObsDetails/DQAContainer";
import ObsDetailsContainer from "components/ObsDetails/ObsDetailsContainer";
import { Heading4 } from "components/SharedComponents";
import UserProfile from "components/UserProfile/UserProfile";
import { t } from "i18next";
import {
  blankHeaderTitle,
  hideHeader,
  removeBottomBorder,
  showHeader,
  showLongHeader
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";

import SharedStackScreens from "./SharedStackScreens";

const taxonSearchTitle = () => <Heading4>{t( "SEARCH-TAXA" )}</Heading4>;
const locationSearchTitle = () => <Heading4>{t( "SEARCH-LOCATION" )}</Heading4>;

const Stack = createNativeStackNavigator( );

const ObservationsStackNavigator = ( ): Node => (
  <Stack.Navigator
    screenOptions={{
      headerBackTitleVisible: false,
      headerTintColor: "black"
    }}
  >
    <Stack.Group>
      <Stack.Screen
        name="ObsList"
        component={MyObservationsContainer}
        options={{
          ...hideHeader
        }}
      />
      <Stack.Screen
        name="ObsDetails"
        component={ObsDetailsContainer}
        options={{
          headerTitle: t( "Observation" ),
          headerShown: false,
          unmountOnBlur: true
        }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfile}
        options={{
          ...showHeader,
          ...blankHeaderTitle,
          ...removeBottomBorder
        }}
      />
      <Stack.Screen
        name="DataQualityAssessment"
        component={DQAContainer}
        options={{
          ...showLongHeader,
          headerTitle: t( "DATA-QUALITY-ASSESSMENT" ),
          unmountOnBlur: true
        }}
      />
    </Stack.Group>
    {SharedStackScreens( )}
    <Stack.Group>
      <Stack.Screen
        name="Explore"
        component={ExploreContainer}
        options={hideHeader}
      />
      <Stack.Screen
        name="ExploreFilterScreen"
        component={ExploreFilterScreen}
        options={hideHeader}
      />
      <Stack.Screen
        name="ExploreTaxonSearch"
        component={ExploreTaxonSearch}
        options={{
          ...removeBottomBorder,
          headerTitle: taxonSearchTitle,
          headerTitleAlign: "center"
        }}
      />
      <Stack.Screen
        name="ExploreLocationSearch"
        component={ExploreLocationSearch}
        options={{
          ...removeBottomBorder,
          headerTitle: locationSearchTitle,
          headerTitleAlign: "center"
        }}
      />
    </Stack.Group>
    <Stack.Screen
      name="Identify"
      component={Identify}
      options={{
        ...removeBottomBorder,
        ...showHeader,
        headerTitle: t( "Identify" )
      }}
    />
  </Stack.Navigator>
);

export default ObservationsStackNavigator;
