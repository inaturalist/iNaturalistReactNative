// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AddIDContainer from "components/AddID/AddIDContainer";
import ExploreContainer from "components/Explore/ExploreContainer";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer";
import DataQualityAssessment from "components/ObsDetails/DataQualityAssessment";
import ObsDetailsContainer from "components/ObsDetails/ObsDetailsContainer";
import ObsEdit from "components/ObsEdit/ObsEdit";
import ProjectDetails from "components/Projects/ProjectDetails";
import Projects from "components/Projects/Projects";
import { Heading4, Mortal, PermissionGate } from "components/SharedComponents";
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
import { PermissionsAndroid } from "react-native";

const EXPLORE_SCREEN_ID = "Explore";

const Stack = createNativeStackNavigator( );

const addIDTitle = ( ) => <Heading4>{t( "ADD-AN-ID" )}</Heading4>;

const ObsEditWithPermission = ( ) => (
  <Mortal>
    <PermissionGate
      permission={PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION}
    >
      <ObsEdit />
    </PermissionGate>
  </Mortal>
);

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
      <Stack.Screen
        name="ObsEdit"
        component={ObsEditWithPermission}
        options={{
          ...removeBottomBorder,
          ...blankHeaderTitle,
          headerBackVisible: false
        }}
      />
      <Stack.Screen
        name="AddID"
        component={AddIDContainer}
        options={{
          ...removeBottomBorder,
          headerTitle: addIDTitle
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
