// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ExploreContainer from "components/Explore/ExploreContainer";
import RootExploreContainer from "components/Explore/RootExploreContainer";
import ExploreLocationSearch from "components/Explore/SearchScreens/ExploreLocationSearch";
import ExploreProjectSearch from "components/Explore/SearchScreens/ExploreProjectSearch";
import ExploreTaxonSearch from "components/Explore/SearchScreens/ExploreTaxonSearch";
import ExploreUserSearch from "components/Explore/SearchScreens/ExploreUserSearch";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer";
import NotificationsContainer from "components/Notifications/NotificationsContainer";
import DQAContainer from "components/ObsDetails/DQAContainer";
import ObsDetailsContainer from "components/ObsDetails/ObsDetailsContainer";
import ProjectDetailsContainer from "components/ProjectDetails/ProjectDetailsContainer";
import ProjectsContainer from "components/Projects/ProjectsContainer";
import { Heading4 } from "components/SharedComponents";
import UserProfile from "components/UserProfile/UserProfile";
import { t } from "i18next";
import {
  blankHeaderTitle,
  hideHeader,
  removeBottomBorder,
  showHeader,
  showLongHeader
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";

import SharedStackScreens from "./SharedStackScreens";

const taxonSearchTitle = () => <Heading4>{t( "SEARCH-TAXA" )}</Heading4>;
const locationSearchTitle = () => <Heading4>{t( "SEARCH-LOCATION" )}</Heading4>;
const userSearchTitle = () => <Heading4>{t( "SEARCH-USERS" )}</Heading4>;
const projectSearchTitle = () => <Heading4>{t( "SEARCH-PROJECTS" )}</Heading4>;
const notificationsTitle = ( ) => <Heading4>{t( "NOTIFICATIONS" )}</Heading4>;

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
        name="Notifications"
        component={NotificationsContainer}
        options={{
          ...showHeader,
          headerTitle: notificationsTitle,
          headerTitleAlign: "center"
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
        name="UserProfile"
        component={UserProfile}
        options={{
          ...showHeader,
          ...blankHeaderTitle,
          ...removeBottomBorder
        }}
      />
      <Stack.Screen
        name="DataQualityAssessment"
        component={DQAContainer}
        options={{
          ...showLongHeader,
          headerTitle: t( "DATA-QUALITY-ASSESSMENT" ),
          unmountOnBlur: true
        }}
      />
    </Stack.Group>
    {SharedStackScreens( )}
    <Stack.Group>
      <Stack.Screen
        name="RootExplore"
        component={RootExploreContainer}
        options={hideHeader}
      />
      <Stack.Screen
        name="Explore"
        component={ExploreContainer}
        options={hideHeader}
      />
      <Stack.Screen
        name="ExploreTaxonSearch"
        component={ExploreTaxonSearch}
        options={{
          ...removeBottomBorder,
          headerTitle: taxonSearchTitle,
          headerTitleAlign: "center"
        }}
      />
      <Stack.Screen
        name="ExploreLocationSearch"
        component={ExploreLocationSearch}
        options={{
          ...removeBottomBorder,
          headerTitle: locationSearchTitle,
          headerTitleAlign: "center"
        }}
      />
      <Stack.Screen
        name="ExploreUserSearch"
        component={ExploreUserSearch}
        options={{
          ...removeBottomBorder,
          headerTitle: userSearchTitle,
          headerTitleAlign: "center"
        }}
      />
      <Stack.Screen
        name="ExploreProjectSearch"
        component={ExploreProjectSearch}
        options={{
          ...removeBottomBorder,
          headerTitle: projectSearchTitle,
          headerTitleAlign: "center"
        }}
      />
      <Stack.Screen
        name="Projects"
        component={ProjectsContainer}
        options={{
          ...removeBottomBorder,
          ...blankHeaderTitle
        }}
      />
      <Stack.Screen
        name="ProjectDetails"
        component={ProjectDetailsContainer}
        options={{
          ...blankHeaderTitle,
          ...removeBottomBorder,
          ...showHeader
        }}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default ObservationsStackNavigator;
