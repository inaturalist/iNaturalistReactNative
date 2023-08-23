// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ExploreContainer from "components/Explore/ExploreContainer";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer";
import DataQualityAssessment from "components/ObsDetails/DataQualityAssessment";
import ObsDetailsContainer from "components/ObsDetails/ObsDetailsContainer";
import ProjectDetails from "components/Projects/ProjectDetails";
import Projects from "components/Projects/Projects";
import TaxonDetails from "components/TaxonDetails/TaxonDetails";
import UserProfile from "components/UserProfile/UserProfile";
import { t } from "i18next";
import {
  blankHeaderTitle,
  hideHeader,
  removeBottomBorder,
  showHeaderLeft,
  showLongHeader
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";

const EXPLORE_SCREEN_ID = "Explore";

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
        name="TaxonDetails"
        component={TaxonDetails}
        options={hideHeader}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfile}
        options={{
          ...showHeaderLeft,
          ...blankHeaderTitle,
          ...removeBottomBorder
        }}
      />
      <Stack.Screen
        name="DataQualityAssessment"
        component={DataQualityAssessment}
        options={{
          ...showLongHeader,
          headerTitle: t( "DATA-QUALITY-ASSESSMENT" ),
          unmountOnBlur: true
        }}
      />
    </Stack.Group>
    <Stack.Screen
      name="Explore"
      component={ExploreContainer}
      options={{
        ...hideHeader,
        meta: {
          icon: "compass-rose-outline",
          testID: EXPLORE_SCREEN_ID,
          accessibilityLabel: t( "Explore" ),
          accessibilityHint: t( "Navigates-to-explore" ),
          size: 40
        }
      }}
    />
    <Stack.Group>
      <Stack.Screen
        name="Projects"
        component={Projects}
        options={{
          ...removeBottomBorder,
          headerTitle: t( "Projects" )
        }}
      />
      <Stack.Screen
        name="ProjectDetails"
        component={ProjectDetails}
        options={{
          ...blankHeaderTitle,
          ...removeBottomBorder,
          ...showHeaderLeft
        }}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default ObservationsStackNavigator;
