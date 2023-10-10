// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AddIDContainer from "components/AddID/AddIDContainer";
import LocationPickerContainer from "components/LocationPicker/LocationPickerContainer";
import MediaViewer from "components/MediaViewer/MediaViewer";
import ObsEdit from "components/ObsEdit/ObsEdit";
import { Heading4 } from "components/SharedComponents";
import { t } from "i18next";
import {
  blankHeaderTitle,
  hideHeader,
  removeBottomBorder
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";

const addIDTitle = ( ) => <Heading4>{t( "ADD-AN-ID" )}</Heading4>;

const Stack = createNativeStackNavigator( );

const SharedStackScreens = ( ): Node => (
  <Stack.Group>
    <Stack.Screen
      name="ObsEdit"
      component={ObsEdit}
      options={{
        ...removeBottomBorder,
        ...blankHeaderTitle,
        headerBackVisible: false,
        headerTitleAlign: "center"
      }}
    />
    <Stack.Screen
      name="AddID"
      component={AddIDContainer}
      options={{
        ...removeBottomBorder,
        headerTitle: addIDTitle,
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
  </Stack.Group>
);

export default SharedStackScreens;
