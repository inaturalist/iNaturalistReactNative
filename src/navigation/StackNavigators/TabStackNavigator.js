// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import About from "components/About";
import Developer from "components/Developer/Developer";
import Log from "components/Developer/Log";
import NetworkLogging from "components/Developer/NetworkLogging.tsx";
import UiLibrary from "components/Developer/UiLibrary";
import UiLibraryItem from "components/Developer/UiLibraryItem";
import Donate from "components/Donate/Donate.tsx";
import ExploreContainer from "components/Explore/ExploreContainer";
import RootExploreContainer from "components/Explore/RootExploreContainer";
import ExploreLocationSearch from "components/Explore/SearchScreens/ExploreLocationSearch";
import ExploreProjectSearch from "components/Explore/SearchScreens/ExploreProjectSearch";
import ExploreTaxonSearch from "components/Explore/SearchScreens/ExploreTaxonSearch";
import ExploreUserSearch from "components/Explore/SearchScreens/ExploreUserSearch";
import Help from "components/Help/Help.tsx";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer";
import NotificationsContainer from "components/Notifications/NotificationsContainer";
import DQAContainer from "components/ObsDetails/DQAContainer";
import ObsDetailsContainer from "components/ObsDetails/ObsDetailsContainer";
import ProjectDetailsContainer from "components/ProjectDetails/ProjectDetailsContainer";
import ProjectRequirements from "components/ProjectDetails/ProjectRequirements.tsx";
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
const dqaTitle = ( ) => <Heading4>{t( "DATA-QUALITY-ASSESSMENT" )}</Heading4>;
const projectRequirementsTitle = () => <Heading4>{t( "PROJECT-REQUIREMENTS" )}</Heading4>;
const projectSearchTitle = () => <Heading4>{t( "SEARCH-PROJECTS" )}</Heading4>;
const taxonSearchTitle = () => <Heading4>{t( "SEARCH-TAXA" )}</Heading4>;
const userSearchTitle = () => <Heading4>{t( "SEARCH-USERS" )}</Heading4>;
const settingsTitle = () => <Heading4>{t( "SETTINGS" )}</Heading4>;

// eslint-disable-next-line i18next/no-literal-string
const debugTitle = () => <Heading4 className="text-white">DEBUG</Heading4>;
// eslint-disable-next-line i18next/no-literal-string
const uiLibTitle = () => <Heading4 className="text-white">UI LIBRARY</Heading4>;
// eslint-disable-next-line i18next/no-literal-string
const uiLibItemTitle = () => <Heading4 className="text-white">UI LIBRARY ITEM</Heading4>;
// eslint-disable-next-line i18next/no-literal-string
const logTitle = () => <Heading4 className="text-white">LOG</Heading4>;

const DQA_OPTIONS = {
  ...showLongHeader,
  headerTitle: dqaTitle,
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
      <Stack.Screen
        name="ProjectRequirements"
        component={ProjectRequirements}
        options={{
          ...showHeader,
          headerTitle: projectRequirementsTitle
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
        component={Developer}
        options={{ headerTitle: debugTitle }}

      />
      { // eslint-disable-next-line no-undef
        __DEV__ && (
          <Stack.Screen
            name="network"
            component={NetworkLogging}
          />
        )
      }
      <Stack.Screen
        name="UILibrary"
        component={UiLibrary}
        options={{ headerTitle: uiLibTitle }}
      />
      <Stack.Screen
        name="UiLibraryItem"
        component={UiLibraryItem}
        options={{ headerTitle: uiLibItemTitle }}
      />
      <Stack.Screen
        component={Log}
        name="log"
        options={{ headerTitle: logTitle }}
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
        options={{ headerTitle: settingsTitle }}
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
