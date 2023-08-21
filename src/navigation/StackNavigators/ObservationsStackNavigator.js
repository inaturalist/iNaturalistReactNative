// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer";
import DataQualityAssessment from "components/ObsDetails/DataQualityAssessment";
import ObsDetailsContainer from "components/ObsDetails/ObsDetailsContainer";
import TaxonDetails from "components/TaxonDetails/TaxonDetails";
import UserProfile from "components/UserProfile/UserProfile";
import { t } from "i18next";
import {
  blankHeaderTitle,
  hideHeader,
  showLongHeader
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";

const Stack = createNativeStackNavigator( );

const ObservationsStackNavigator = ( ): Node => (
  <Stack.Navigator>
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
        options={blankHeaderTitle}
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
  </Stack.Navigator>
);

export default ObservationsStackNavigator;
