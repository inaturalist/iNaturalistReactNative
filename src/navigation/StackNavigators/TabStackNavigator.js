// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import About from "components/About";
import Developer from "components/Developer/Developer";
import Log from "components/Developer/Log";
import NetworkLogging from "components/Developer/NetworkLogging";
import UiLibrary from "components/Developer/UiLibrary";
import UiLibraryItem from "components/Developer/UiLibraryItem";
import Donate from "components/Donate/Donate.tsx";
import ExploreContainer from "components/Explore/ExploreContainer";
import RootExploreContainer from "components/Explore/RootExploreContainer";
import ExploreLocationSearch from "components/Explore/SearchScreens/ExploreLocationSearch";
import ExploreProjectSearch from "components/Explore/SearchScreens/ExploreProjectSearch";
import ExploreTaxonSearch from "components/Explore/SearchScreens/ExploreTaxonSearch";
import ExploreUserSearch from "components/Explore/SearchScreens/ExploreUserSearch";
import Help from "components/Help/Help";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer";
import NotificationsContainer from "components/Notifications/NotificationsContainer";
import DQAContainer from "components/ObsDetails/DQAContainer";
import ObsDetailsContainer from "components/ObsDetails/ObsDetailsContainer";
import ProjectDetailsContainer from "components/ProjectDetails/ProjectDetailsContainer";
import ProjectsContainer from "components/Projects/ProjectsContainer.tsx";
import Settings from "components/Settings/Settings";
import { Heading4 } from "components/SharedComponents";
import UserProfile from "components/UserProfile/UserProfile";
import { t } from "i18next";
import {
  blankHeaderTitle,
  hideHeader,
  hideHeaderLeft,
  removeBottomBorder,
  showHeader,
  showLongHeader
} from "navigation/navigationOptions";
import type { Node } from "react";
import React from "react";

import SharedStackScreens from "./SharedStackScreens";

const aboutTitle = () => <Heading4>{t( "ABOUT-INATURALIST" )}</Heading4>;
const donateTitle = () => <Heading4>{t( "DONATE" )}</Heading4>;
const helpTitle = () => <Heading4>{t( "HELP" )}</Heading4>;
const locationSearchTitle = () => <Heading4>{t( "SEARCH-LOCATION" )}</Heading4>;
const notificationsTitle = ( ) => <Heading4>{t( "NOTIFICATIONS" )}</Heading4>;
const projectSearchTitle = () => <Heading4>{t( "SEARCH-PROJECTS" )}</Heading4>;
const taxonSearchTitle = () => <Heading4>{t( "SEARCH-TAXA" )}</Heading4>;
const userSearchTitle = () => <Heading4>{t( "SEARCH-USERS" )}</Heading4>;

const DQA_OPTIONS = {
  ...showLongHeader,
  headerTitle: t( "DATA-QUALITY-ASSESSMENT" ),
  unmountOnBlur: true
};

const USER_PROFILE_OPTIONS = {
  ...showHeader,
  ...blankHeaderTitle,
  ...removeBottomBorder
};

const NOTIFICATIONS_OPTIONS = {
  ...hideHeaderLeft,
  headerTitle: notificationsTitle,
  headerTitleAlign: "center"
};

const Stack = createNativeStackNavigator( );

const TabStackNavigator = ( ): Node => (
  <Stack.Navigator
    screenOptions={{
      headerBackTitleVisible: false,
      headerTintColor: "black"
    }}
  >
    {/* Screens with no header */}
    <Stack.Group
      screenOptions={{ ...hideHeader }}
    >
      <Stack.Screen
        name="ObsList"
        component={MyObservationsContainer}
      />
      <Stack.Screen
        name="ObsDetails"
        component={ObsDetailsContainer}
        options={{
          unmountOnBlur: true
        }}
      />
      <Stack.Screen
        name="RootExplore"
        component={RootExploreContainer}
      />
      <Stack.Screen
        name="Explore"
        component={ExploreContainer}
      />
    </Stack.Group>
    <Stack.Screen
      name="Notifications"
      component={NotificationsContainer}
      options={NOTIFICATIONS_OPTIONS}
    />
    <Stack.Screen
      name="UserProfile"
      component={UserProfile}
      options={USER_PROFILE_OPTIONS}
    />
    <Stack.Screen
      name="DataQualityAssessment"
      component={DQAContainer}
      options={DQA_OPTIONS}
    />
    {SharedStackScreens( )}
    {/* Project Stack Group */}
    <Stack.Group
      screenOptions={{
        ...blankHeaderTitle
      }}
    >
      <Stack.Screen
        name="Projects"
        component={ProjectsContainer}
        options={{ ...removeBottomBorder }}
      />
      <Stack.Screen
        name="ProjectDetails"
        component={ProjectDetailsContainer}
        options={{
          ...showHeader
        }}
      />
    </Stack.Group>
    {/* Developer Stack Group */}
    <Stack.Group
      screenOptions={{
        headerStyle: { backgroundColor: "deeppink", color: "white" },
        headerTintColor: "white",
        headerTitleStyle: { color: "white" }
      }}
    >
      <Stack.Screen
        name="Debug"
        label="Debug"
        component={Developer}
      />
      <Stack.Screen
        name="network"
        component={NetworkLogging}
      />
      <Stack.Screen
        name="UILibrary"
        label="UI Library"
        component={UiLibrary}
      />
      <Stack.Screen
        name="UiLibraryItem"
        label="UI Library Item"
        component={UiLibraryItem}
      />
      <Stack.Screen
        name="log"
        component={Log}
      />
    </Stack.Group>
    {/* Header with no bottom border */}
    <Stack.Group
      screenOptions={{
        headerTitleAlign: "center",
        ...removeBottomBorder
      }}
    >
      <Stack.Screen
        name="ExploreTaxonSearch"
        component={ExploreTaxonSearch}
        options={{
          headerTitle: taxonSearchTitle
        }}
      />
      <Stack.Screen
        name="ExploreLocationSearch"
        component={ExploreLocationSearch}
        options={{
          headerTitle: locationSearchTitle
        }}
      />
      <Stack.Screen
        name="ExploreUserSearch"
        component={ExploreUserSearch}
        options={{
          headerTitle: userSearchTitle
        }}
      />
      <Stack.Screen
        name="ExploreProjectSearch"
        component={ExploreProjectSearch}
        options={{
          headerTitle: projectSearchTitle
        }}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ headerTitle: t( "Settings" ) }}
      />
      <Stack.Screen
        name="About"
        component={About}
        options={{
          headerTitle: aboutTitle
        }}
      />
      <Stack.Screen
        name="Donate"
        component={Donate}
        options={{
          headerTitle: donateTitle
        }}
      />
      <Stack.Screen
        name="Help"
        component={Help}
        options={{
          headerTitle: helpTitle
        }}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default TabStackNavigator;
