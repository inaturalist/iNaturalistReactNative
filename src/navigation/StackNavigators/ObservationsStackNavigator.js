// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AddIDContainer from "components/AddID/AddIDContainer";
import ExploreContainer from "components/Explore/ExploreContainer";
import Identify from "components/Identify/Identify";
import LocationPickerContainer from "components/LocationPicker/LocationPickerContainer";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer";
import DataQualityAssessment from "components/ObsDetails/DataQualityAssessment";
import ObsDetailsContainer from "components/ObsDetails/ObsDetailsContainer";
import ObsEdit from "components/ObsEdit/ObsEdit";
import PlaceholderComponent from "components/PlaceholderComponent";
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
          ...showHeaderLeft,
          headerTitle: addIDTitle
        }}
      />
      <Stack.Screen
        name="LocationPicker"
        component={LocationPickerContainer}
        options={hideHeader}
      />
    </Stack.Group>
    <Stack.Group>
      <Stack.Screen
        name="Explore"
        component={ExploreContainer}
        options={hideHeader}
      />
      <Stack.Screen
        name="ExploreFilters"
        component={PlaceholderComponent}
        options={{
          ...showHeaderLeft,
          ...removeBottomBorder
        }}
      />
    </Stack.Group>
    <Stack.Screen
      name="Identify"
      component={Identify}
      options={{
        ...removeBottomBorder,
        ...showHeaderLeft,
        headerTitle: t( "Identify" )
      }}
    />
  </Stack.Navigator>
);

export default ObservationsStackNavigator;
