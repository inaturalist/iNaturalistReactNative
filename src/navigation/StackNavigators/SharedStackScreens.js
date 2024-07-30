// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FullPageWebView from "components/FullPageWebView/FullPageWebView";
import LocationPickerContainer from "components/LocationPicker/LocationPickerContainer";
import ObsEdit from "components/ObsEdit/ObsEdit";
import PhotoSharing from "components/PhotoSharing";
import { Heading4 } from "components/SharedComponents";
import SuggestionsContainer from "components/Suggestions/SuggestionsContainer.tsx";
import TaxonSearch from "components/Suggestions/TaxonSearch";
import TaxonDetails from "components/TaxonDetails/TaxonDetails";
import { t } from "i18next";
import {
  hideHeader,
  removeBottomBorder,
  showSimpleCustomHeader
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";

const suggestionsTitle = ( ) => <Heading4>{t( "ADD-AN-ID" )}</Heading4>;
const taxonSearchTitle = ( ) => <Heading4>{t( "SEARCH" )}</Heading4>;

const Stack = createNativeStackNavigator( );

// These screens need to be within the NoBottomTabStackNavigator
// as well as the TabStackNavigator to retain navigation history

const SharedStackScreens = ( ): Node => (
  <Stack.Group
    screenOptions={{
      cardStyle: {
        backgroundColor: "rgba(0,0,0,0)",
        opacity: 1
      }
    }}
  >
    {/* Screens with hidden header */}
    <Stack.Group
      screenOptions={{
        ...hideHeader
      }}
    >
      <Stack.Screen
        name="ObsEdit"
        component={ObsEdit}
        // 20240730 - amanda: we need to disable swiping on ObsEdit
        // options={{
        //   gestureEnabled: false
        // }}
      />
      <Stack.Screen
        name="LocationPicker"
        component={LocationPickerContainer}
      />
      <Stack.Screen
        name="TaxonDetails"
        component={TaxonDetails}
      />
      <Stack.Screen
        name="PhotoSharing"
        component={PhotoSharing}
      />
    </Stack.Group>
    {/* Screens with centered header */}
    <Stack.Group
      screenOptions={{
        ...removeBottomBorder,
        headerTitleAlign: "center",
        headerBackTitleVisible: false
      }}
    >
      <Stack.Screen
        name="Suggestions"
        component={SuggestionsContainer}
        options={{
          headerTitle: suggestionsTitle
        }}
      />
      <Stack.Screen
        name="TaxonSearch"
        component={TaxonSearch}
        options={{
          headerTitle: taxonSearchTitle
        }}
      />
    </Stack.Group>
    <Stack.Screen
      name="FullPageWebView"
      component={FullPageWebView}
      options={showSimpleCustomHeader}
    />
  </Stack.Group>
);

export default SharedStackScreens;
