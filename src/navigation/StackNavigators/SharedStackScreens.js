// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LocationPickerContainer from "components/LocationPicker/LocationPickerContainer";
import MediaViewer from "components/MediaViewer/MediaViewer";
import ObsEdit from "components/ObsEdit/ObsEdit";
import { Heading4, Mortal, PermissionGate } from "components/SharedComponents";
import SuggestionsContainer from "components/Suggestions/SuggestionsContainer";
import TaxonSearch from "components/Suggestions/TaxonSearch";
import TaxonDetails from "components/TaxonDetails/TaxonDetails";
import { t } from "i18next";
import {
  blankHeaderTitle,
  hideHeader,
  removeBottomBorder
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";
import { PermissionsAndroid } from "react-native";

const suggestionsTitle = ( ) => <Heading4>{t( "ADD-AN-ID" )}</Heading4>;
const taxonSearchTitle = ( ) => <Heading4>{t( "SEARCH" )}</Heading4>;

const Stack = createNativeStackNavigator( );

const ObsEditWithPermission = ( ) => (
  <Mortal>
    <PermissionGate
      permission={PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION}
    >
      <ObsEdit />
    </PermissionGate>
  </Mortal>
);

const SharedStackScreens = ( ): Node => (
  <Stack.Group
    screenOptions={{
      cardStyle: {
        backgroundColor: "rgba(0,0,0,0)",
        opacity: 1
      }
    }}
  >
    <Stack.Screen
      name="ObsEdit"
      component={ObsEditWithPermission}
      options={{
        ...removeBottomBorder,
        ...blankHeaderTitle,
        headerBackVisible: false,
        headerTitleAlign: "center"
      }}
    />
    <Stack.Screen
      name="Suggestions"
      component={SuggestionsContainer}
      options={{
        ...removeBottomBorder,
        headerTitle: suggestionsTitle,
        headerTitleAlign: "center",
        headerBackTitleVisible: false
      }}
    />
    <Stack.Screen
      name="TaxonSearch"
      component={TaxonSearch}
      options={{
        ...removeBottomBorder,
        headerTitle: taxonSearchTitle,
        headerTitleAlign: "center"
      }}
    />
    <Stack.Screen
      name="LocationPicker"
      component={LocationPickerContainer}
      options={hideHeader}
    />
    <Stack.Screen
      name="MediaViewer"
      component={MediaViewer}
      options={{
        ...blankHeaderTitle,
        headerTitleAlign: "center",
        headerTintColor: "white",
        headerBackTitleVisible: false,
        headerStyle: {
          backgroundColor: "black"
        }
      }}
    />
    <Stack.Screen
      name="TaxonDetails"
      component={TaxonDetails}
      options={hideHeader}
    />
  </Stack.Group>
);

export default SharedStackScreens;
