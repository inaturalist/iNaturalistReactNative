// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import About from "components/About.tsx";
import Developer from "components/Developer/Developer";
import Log from "components/Developer/Log";
import UiLibrary from "components/Developer/UiLibrary";
import UiLibraryItem from "components/Developer/UiLibraryItem";
import Donate from "components/Donate/Donate.tsx";
import ExploreContainer from "components/Explore/ExploreContainer";
import RootExploreContainer from "components/Explore/RootExploreContainer";
import ExploreLocationSearch from "components/Explore/SearchScreens/ExploreLocationSearch.tsx";
import ExploreProjectSearch from "components/Explore/SearchScreens/ExploreProjectSearch.tsx";
import ExploreTaxonSearch from "components/Explore/SearchScreens/ExploreTaxonSearch";
import ExploreUserSearch from "components/Explore/SearchScreens/ExploreUserSearch";
import Help from "components/Help/Help.tsx";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer.tsx";
import Notifications from "components/Notifications/Notifications.tsx";
import DQAContainer from "components/ObsDetails/DQAContainer";
import ObsDetailsContainer from "components/ObsDetails/ObsDetailsContainer";
import ObsDetailsDefaultModeContainer
  from "components/ObsDetailsDefaultMode/ObsDetailsDefaultModeContainer";
import ProjectDetailsContainer from "components/ProjectDetails/ProjectDetailsContainer";
import ProjectMembers from "components/ProjectDetails/ProjectMembers.tsx";
import ProjectRequirements from "components/ProjectDetails/ProjectRequirements.tsx";
import ProjectListContainer from "components/ProjectList/ProjectListContainer.tsx";
import ProjectsContainer from "components/Projects/ProjectsContainer.tsx";
import Settings from "components/Settings/Settings";
import { Heading4 } from "components/SharedComponents";
import FollowersList from "components/UserProfile/FollowersList.tsx";
import FollowingList from "components/UserProfile/FollowingList.tsx";
import UserProfile from "components/UserProfile/UserProfile";
import { t } from "i18next";
import ContextHeader from "navigation/ContextHeader";
import {
  blankHeaderTitle,
  hideHeader,
  hideHeaderLeft,
  isDrawerScreen,
  preventSwipeToGoBack,
  removeBottomBorder,
  showHeader,
  showLongHeader
} from "navigation/navigationOptions.tsx";
import type { Node } from "react";
import React from "react";
import {
  useLayoutPrefs
} from "sharedHooks";
import colors from "styles/tailwindColors";

import SharedStackScreens from "./SharedStackScreens";

type TabStackNavigatorProps = {
  route?: Object
};

const aboutTitle = () => (
  <Heading4 accessibilityRole="header" numberOfLines={1}>
    {t( "ABOUT-INATURALIST" )}
  </Heading4>
);
const donateTitle = () => (
  <Heading4 accessibilityRole="header" numberOfLines={1}>
    {t( "DONATE" )}
  </Heading4>
);
const helpTitle = () => (
  <Heading4 accessibilityRole="header" numberOfLines={1}>
    {t( "HELP" )}
  </Heading4>
);
const locationSearchTitle = () => (
  <Heading4 accessibilityRole="header" numberOfLines={1}>
    {t( "SEARCH-LOCATION" )}
  </Heading4>
);
const dqaTitle = () => (
  <Heading4 accessibilityRole="header" numberOfLines={1}>
    {t( "DATA-QUALITY-ASSESSMENT" )}
  </Heading4>
);
const projectRequirementsTitle = () => (
  <Heading4 accessibilityRole="header" numberOfLines={1}>
    {t( "PROJECT-REQUIREMENTS" )}
  </Heading4>
);
const projectSearchTitle = () => (
  <Heading4 accessibilityRole="header" numberOfLines={1}>
    {t( "SEARCH-PROJECTS" )}
  </Heading4>
);
const taxonSearchTitle = () => (
  <Heading4 accessibilityRole="header" numberOfLines={1}>
    {t( "SEARCH-TAXA" )}
  </Heading4>
);
const userSearchTitle = () => (
  <Heading4 accessibilityRole="header" numberOfLines={1}>
    {t( "SEARCH-USERS" )}
  </Heading4>
);
const settingsTitle = () => (
  <Heading4 accessibilityRole="header" numberOfLines={1}>
    {t( "SETTINGS" )}
  </Heading4>
);
const notificationsTitle = () => (
  <Heading4 accessibilityRole="header" numberOfLines={1}>
    {t( "NOTIFICATIONS" )}
  </Heading4>
);

// eslint-disable-next-line i18next/no-literal-string
const debugTitle = () => <Heading4 className="text-white">DEBUG</Heading4>;
// eslint-disable-next-line i18next/no-literal-string
const uiLibTitle = () => <Heading4 className="text-white">UI LIBRARY</Heading4>;
// eslint-disable-next-line i18next/no-literal-string
const uiLibItemTitle = () => <Heading4 className="text-white">UI LIBRARY ITEM</Heading4>;
// eslint-disable-next-line i18next/no-literal-string
const logTitle = () => <Heading4 className="text-white">LOG</Heading4>;

const NOTIFICATIONS_OPTIONS = {
  ...preventSwipeToGoBack,
  ...hideHeaderLeft,
  headerTitle: notificationsTitle,
  headerTitleAlign: "center"
};

const DQA_OPTIONS = {
  ...showLongHeader,
  headerTitle: dqaTitle
};

const USER_PROFILE_OPTIONS = {
  ...showHeader,
  ...blankHeaderTitle,
  ...removeBottomBorder
};

const LIST_OPTIONS = {
  header: ContextHeader,
  alignStart: true,
  lazy: true
};

const OBS_DETAILS_OPTIONS = {
  ...showHeader,
  ...blankHeaderTitle
};

const Stack = createNativeStackNavigator( );

export const SCREEN_NAME_OBS_LIST = "ObsList";
export const SCREEN_NAME_ROOT_EXPLORE = "RootExplore";
export const SCREEN_NAME_NOTIFICATIONS = "Notifications";

const TabStackNavigator = ( { route }: TabStackNavigatorProps ): Node => {
  const initialRouteName = route?.params?.initialRouteName || SCREEN_NAME_OBS_LIST;

  const {
    isDefaultMode
  } = useLayoutPrefs( );
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        headerTintColor: colors.darkGray
      }}
    >
      {/* Screens with no header */}
      <Stack.Group
        screenOptions={{ ...hideHeader }}
      >
        <Stack.Screen
          name={SCREEN_NAME_OBS_LIST}
          component={MyObservationsContainer}
          options={{
            ...preventSwipeToGoBack
          }}
        />
        <Stack.Screen
          name={SCREEN_NAME_ROOT_EXPLORE}
          component={RootExploreContainer}
          options={{
            ...preventSwipeToGoBack
          }}
        />
        <Stack.Screen
          name="Explore"
          component={ExploreContainer}
        />
        {isDefaultMode
          ? (
            <Stack.Screen
              name="ObsDetails"
              component={ObsDetailsDefaultModeContainer}
              options={OBS_DETAILS_OPTIONS}
            />
          )
          : (
            <Stack.Screen
              name="ObsDetails"
              component={ObsDetailsContainer}
              options={OBS_DETAILS_OPTIONS}
            />
          )}
      </Stack.Group>
      <Stack.Screen
        name={SCREEN_NAME_NOTIFICATIONS}
        component={Notifications}
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
          options={{
            ...isDrawerScreen,
            ...removeBottomBorder,
            ...preventSwipeToGoBack
          }}
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
        <Stack.Screen
          name="ProjectMembers"
          component={ProjectMembers}
          options={LIST_OPTIONS}
        />
        <Stack.Screen
          name="ProjectList"
          component={ProjectListContainer}
          options={LIST_OPTIONS}
        />
        <Stack.Screen
          name="FollowersList"
          component={FollowersList}
          options={LIST_OPTIONS}
        />
        <Stack.Screen
          name="FollowingList"
          component={FollowingList}
          options={LIST_OPTIONS}
        />
      </Stack.Group>
      {/* Developer Stack Group */}
      <Stack.Group
        screenOptions={{
          ...isDrawerScreen,
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
          options={{
            ...isDrawerScreen,
            headerTitle: settingsTitle
          }}
        />
        <Stack.Screen
          name="About"
          component={About}
          options={{
            ...isDrawerScreen,
            headerTitle: aboutTitle
          }}
        />
        <Stack.Screen
          name="Donate"
          component={Donate}
          options={{
            ...isDrawerScreen,
            headerTitle: donateTitle
          }}
        />
        <Stack.Screen
          name="Help"
          component={Help}
          options={{
            ...isDrawerScreen,
            headerTitle: helpTitle
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default TabStackNavigator;
