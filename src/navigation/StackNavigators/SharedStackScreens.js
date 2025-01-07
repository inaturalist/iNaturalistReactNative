// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FullPageWebView from "components/FullPageWebView/FullPageWebView.tsx";
import LocationPickerContainer from "components/LocationPicker/LocationPickerContainer";
import MatchContainer from "components/Match/MatchContainer";
import ObsEdit from "components/ObsEdit/ObsEdit";
import PhotoSharing from "components/PhotoSharing";
import { Heading4 } from "components/SharedComponents";
import SuggestionsContainer from "components/Suggestions/SuggestionsContainer.tsx";
import SuggestionsTaxonSearch from "components/Suggestions/SuggestionsTaxonSearch.tsx";
import TaxonDetails from "components/TaxonDetails/TaxonDetails";
import { t } from "i18next";
import {
  blankHeaderTitle,
  fadeInComponent,
  hideHeader,
  removeBottomBorder,
  showHeader,
  showSimpleCustomHeader
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";
import { useLayoutPrefs } from "sharedHooks";

const suggestionsTitle = ( ) => <Heading4>{t( "ADD-AN-ID" )}</Heading4>;
const taxonSearchTitle = ( ) => <Heading4>{t( "SEARCH" )}</Heading4>;

const Stack = createNativeStackNavigator( );

// note: react navigation 7 will have a layout prop
// which should replace all of these individual wrappers
const FadeInObsEdit = ( ) => fadeInComponent( <ObsEdit /> );
const FadeInLocationPickerContainer = ( ) => fadeInComponent( <LocationPickerContainer /> );
const FadeInPhotoSharing = ( ) => fadeInComponent( <PhotoSharing /> );
const FadeInTaxonDetails = ( ) => fadeInComponent( <TaxonDetails /> );
const FadeInSuggestionsContainer = ( ) => fadeInComponent( <SuggestionsContainer /> );
const FadeInTaxonSearch = ( ) => fadeInComponent( <SuggestionsTaxonSearch /> );
const FadeInFullPageWebView = ( ) => fadeInComponent( <FullPageWebView /> );
const FadeInMatchContainer = ( ) => fadeInComponent(
  <MatchContainer />
);

// These screens need to be within the NoBottomTabStackNavigator
// as well as the TabStackNavigator to retain navigation history

const SharedStackScreens = ( ): Node => {
  const {
    isDefaultMode
  } = useLayoutPrefs( );

  return (
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
          component={FadeInObsEdit}
        />
        <Stack.Screen
          name="LocationPicker"
          component={FadeInLocationPickerContainer}
        />
        <Stack.Screen
          name="TaxonDetails"
          component={FadeInTaxonDetails}
        />
        <Stack.Screen
          name="PhotoSharing"
          component={FadeInPhotoSharing}
        />
      </Stack.Group>
      {/* Screens with centered header */}
      <Stack.Group
        screenOptions={{
          ...removeBottomBorder,
          ...showHeader,
          headerTitleAlign: "center",
          headerBackTitleVisible: false
        }}
      >
        {isDefaultMode
          ? (
            <Stack.Screen
              name="Suggestions"
              component={FadeInMatchContainer}
              options={{
                unmountOnBlur: true,
                ...showHeader,
                ...blankHeaderTitle
              }}
            />
          )
          : (
            <Stack.Screen
              name="Suggestions"
              component={FadeInSuggestionsContainer}
              options={{
                headerTitle: suggestionsTitle
              }}
            />
          )}
        <Stack.Screen
          name="TaxonSearch"
          component={FadeInTaxonSearch}
          options={{
            headerTitle: taxonSearchTitle
          }}
        />
      </Stack.Group>
      <Stack.Screen
        name="FullPageWebView"
        component={FadeInFullPageWebView}
        options={showSimpleCustomHeader}
      />
    </Stack.Group>
  );
};

export default SharedStackScreens;
