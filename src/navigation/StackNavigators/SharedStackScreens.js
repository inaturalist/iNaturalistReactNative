// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FullPageWebView from "components/FullPageWebView/FullPageWebView.tsx";
import LocationPickerContainer from "components/LocationPicker/LocationPickerContainer";
import MatchContainer from "components/Match/MatchContainer";
import MatchTaxonSearchScreen from "components/Match/MatchTaxonSearchScreen.tsx";
import ObsEdit from "components/ObsEdit/ObsEdit";
import PhotoSharing from "components/PhotoSharing.tsx";
import { Heading4 } from "components/SharedComponents";
import SuggestionsContainer from "components/Suggestions/SuggestionsContainer.tsx";
import SuggestionsTaxonSearch from "components/Suggestions/SuggestionsTaxonSearch.tsx";
import TaxonDetails from "components/TaxonDetails/TaxonDetails";
import { t } from "i18next";
import {
  blankHeaderTitle,
  hideHeader,
  removeBottomBorder,
  showHeader,
  showSimpleCustomHeader
} from "navigation/navigationOptions.tsx";
import type { Node } from "react";
import React from "react";

const suggestionsTitle = () => (
  <Heading4 accessibilityRole="header" numberOfLines={1}>
    {t( "ADD-AN-ID" )}
  </Heading4>
);
const taxonSearchTitle = () => (
  <Heading4 accessibilityRole="header" numberOfLines={1}>
    {t( "SEARCH" )}
  </Heading4>
);

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
      <Stack.Screen name="ObsEdit" component={ObsEdit} />
      <Stack.Screen name="LocationPicker" component={LocationPickerContainer} />
      <Stack.Screen name="TaxonDetails" component={TaxonDetails} />
      <Stack.Screen name="PhotoSharing" component={PhotoSharing} />
    </Stack.Group>
    {/* Screens with centered header */}
    <Stack.Group
      screenOptions={{
        ...removeBottomBorder,
        ...showHeader,
        headerTitleAlign: "center",
        headerBackButtonDisplayMode: "minimal"
      }}
    >
      {/* note: unmountOnBlur no longer exists in React Navigation 7,
      but if we need that functionality and run into issues with the
      screen not unmounting property, we can try using layout props as described
      here: https://reactnavigation.org/docs/upgrading-from-6.x#the-unmountonblur-option-is-removed-in-favor-of-poptotoponblur-in-bottom-tab-navigator-and-drawer-navigator
      */}
      <Stack.Screen
        name="Match"
        component={MatchContainer}
        options={{
          ...showHeader,
          ...blankHeaderTitle
        }}
      />
      <Stack.Screen
        name="Suggestions"
        component={SuggestionsContainer}
        options={{
          headerTitle: suggestionsTitle
        }}
      />
      <Stack.Screen
        name="SuggestionsTaxonSearch"
        component={SuggestionsTaxonSearch}
        options={{
          headerTitle: taxonSearchTitle
        }}
      />
      <Stack.Screen
        name="MatchTaxonSearchScreen"
        component={MatchTaxonSearchScreen}
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
