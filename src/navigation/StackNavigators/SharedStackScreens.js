// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LocationPickerContainer from "components/LocationPicker/LocationPickerContainer";
import ObsEdit from "components/ObsEdit/ObsEdit";
import { Heading4 } from "components/SharedComponents";
import SuggestionsContainer from "components/Suggestions/SuggestionsContainer";
import TaxonSearch from "components/Suggestions/TaxonSearch";
import TaxonDetails from "components/TaxonDetails/TaxonDetails";
import { t } from "i18next";
import {
  hideHeader,
  removeBottomBorder
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";

const suggestionsTitle = ( ) => <Heading4>{t( "ADD-AN-ID" )}</Heading4>;
const taxonSearchTitle = ( ) => <Heading4>{t( "SEARCH" )}</Heading4>;

const Stack = createNativeStackNavigator( );

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
      component={ObsEdit}
      options={hideHeader}
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
      name="TaxonDetails"
      component={TaxonDetails}
      options={hideHeader}
    />
  </Stack.Group>
);

export default SharedStackScreens;
