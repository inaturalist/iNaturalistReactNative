// @flow

// eslint-disable-next-line import/no-extraneous-dependencies
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import About from "components/About";
import Developer from "components/Developer/Developer";
import Log from "components/Developer/Log";
import UiLibrary from "components/Developer/UiLibrary";
import UiLibraryItem from "components/Developer/UiLibraryItem";
import Donate from "components/Donate/Donate";
import ExploreContainer from "components/Explore/ExploreContainer";
import RootExploreContainer from "components/Explore/RootExploreContainer";
import ExploreLocationSearch from "components/Explore/SearchScreens/ExploreLocationSearch";
import ExploreProjectSearch from "components/Explore/SearchScreens/ExploreProjectSearch";
import ExploreTaxonSearch from "components/Explore/SearchScreens/ExploreTaxonSearch";
import ExploreUserSearch from "components/Explore/SearchScreens/ExploreUserSearch";
import Help from "components/Help/Help";
import Menu from "components/Menu/Menu";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer";
import Notifications from "components/Notifications/Notifications";
import DQAContainer from "components/ObsDetails/DQAContainer";
import ObsDetailsContainer from "components/ObsDetails/ObsDetailsContainer";
import ObsDetailsDefaultModeScreensWrapper
  from "components/ObsDetailsDefaultMode/ObsDetailsDefaultModeScreensWrapper";
import ProjectDetailsContainer from "components/ProjectDetails/ProjectDetailsContainer";
import ProjectMembers from "components/ProjectDetails/ProjectMembers";
import ProjectRequirements from "components/ProjectDetails/ProjectRequirements";
import ProjectListContainer from "components/ProjectList/ProjectListContainer";
import ProjectsContainer from "components/Projects/ProjectsContainer";
import Settings from "components/Settings/Settings";
import { Heading4 } from "components/SharedComponents";
import FollowersList from "components/UserProfile/FollowersList";
import FollowingList from "components/UserProfile/FollowingList";
import UserProfile from "components/UserProfile/UserProfile";
import { t } from "i18next";
import ContextHeader from "navigation/ContextHeader";
import {
  blankHeaderTitle,
  fadeInComponent,
  hideHeader,
  hideHeaderLeft,
  preventSwipeToGoBack,
  removeBottomBorder,
  showHeader,
  showLongHeader
} from "navigation/navigationOptions";
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

// note: react navigation 7 will have a layout prop
// which should replace all of these individual wrappers
const FadeInMenu = () => fadeInComponent( <Menu /> );
const FadeInNotifications = ( ) => fadeInComponent( <Notifications /> );
const FadeInRootExplore = ( ) => fadeInComponent( <RootExploreContainer /> );
const FadeInMyObservations = ( ) => fadeInComponent( <MyObservationsContainer /> );
const FadeInUserProfile = ( ) => fadeInComponent( <UserProfile /> );
const FadeInExploreContainer = ( ) => fadeInComponent( <ExploreContainer /> );
const FadeInObsDetailsDefaultModeScreensWrapper = ( ) => fadeInComponent(
  <ObsDetailsDefaultModeScreensWrapper />
);
const FadeInObsDetailsContainer = ( ) => fadeInComponent(
  <ObsDetailsContainer />
);
const FadeInDQAContainer = ( ) => fadeInComponent( <DQAContainer /> );
const FadeInProjectsContainer = ( ) => fadeInComponent( <ProjectsContainer /> );
const FadeInProjectDetailsContainer = ( ) => fadeInComponent( <ProjectDetailsContainer /> );
const FadeInProjectRequirements = ( ) => fadeInComponent( <ProjectRequirements /> );
const FadeInProjectMembers = ( ) => fadeInComponent( <ProjectMembers /> );
const FadeInSettings = ( ) => fadeInComponent( <Settings /> );
const FadeInHelp = ( ) => fadeInComponent( <Help /> );
const FadeInAbout = ( ) => fadeInComponent( <About /> );
const FadeInDonate = ( ) => fadeInComponent( <Donate /> );
const FadeInProjectList = ( ) => fadeInComponent( <ProjectListContainer /> );
const FadeInFollowersList = ( ) => fadeInComponent( <FollowersList /> );
const FadeInFollowingList = ( ) => fadeInComponent( <FollowingList /> );

const NOTIFICATIONS_OPTIONS = {
  ...preventSwipeToGoBack,
  ...hideHeaderLeft,
  headerTitle: notificationsTitle,
  headerTitleAlign: "center",
  animation: "none"
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

export const SCREEN_NAME_MENU = "Menu";
export const SCREEN_NAME_ROOT_EXPLORE = "RootExplore";
export const SCREEN_NAME_OBS_LIST = "ObsList";
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
          name={SCREEN_NAME_MENU}
          component={FadeInMenu}
          options={{
            ...preventSwipeToGoBack,
            animation: "none"
          }}
        />
        <Stack.Screen
          name={SCREEN_NAME_OBS_LIST}
          component={FadeInMyObservations}
          options={{
            ...preventSwipeToGoBack,
            animation: "none"
          }}
        />
        <Stack.Screen
          name={SCREEN_NAME_ROOT_EXPLORE}
          component={FadeInRootExplore}
          options={{
            ...preventSwipeToGoBack,
            animation: "none"
          }}
        />
        <Stack.Screen
          name="Explore"
          component={FadeInExploreContainer}
        />
        {isDefaultMode
          ? (
            <Stack.Screen
              name="ObsDetails"
              component={FadeInObsDetailsDefaultModeScreensWrapper}
              options={OBS_DETAILS_OPTIONS}
            />
          )
          : (
            <Stack.Screen
              name="ObsDetails"
              component={FadeInObsDetailsContainer}
              options={OBS_DETAILS_OPTIONS}
            />
          )}
      </Stack.Group>
      <Stack.Screen
        name={SCREEN_NAME_NOTIFICATIONS}
        component={FadeInNotifications}
        options={NOTIFICATIONS_OPTIONS}
      />
      <Stack.Screen
        name="UserProfile"
        component={FadeInUserProfile}
        options={USER_PROFILE_OPTIONS}
      />
      <Stack.Screen
        name="DataQualityAssessment"
        component={FadeInDQAContainer}
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
          component={FadeInProjectsContainer}
          options={{
            ...removeBottomBorder,
            ...preventSwipeToGoBack
          }}
        />
        <Stack.Screen
          name="ProjectDetails"
          component={FadeInProjectDetailsContainer}
          options={{
            ...showHeader
          }}
        />
        <Stack.Screen
          name="ProjectRequirements"
          component={FadeInProjectRequirements}
          options={{
            ...showHeader,
            headerTitle: projectRequirementsTitle
          }}
        />
        <Stack.Screen
          name="ProjectMembers"
          component={FadeInProjectMembers}
          options={LIST_OPTIONS}
        />
        <Stack.Screen
          name="ProjectList"
          component={FadeInProjectList}
          options={LIST_OPTIONS}
        />
        <Stack.Screen
          name="FollowersList"
          component={FadeInFollowersList}
          options={LIST_OPTIONS}
        />
        <Stack.Screen
          name="FollowingList"
          component={FadeInFollowingList}
          options={LIST_OPTIONS}
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
          component={FadeInSettings}
          options={{
            headerTitle: settingsTitle
          }}
        />
        <Stack.Screen
          name="About"
          component={FadeInAbout}
          options={{
            headerTitle: aboutTitle
          }}
        />
        <Stack.Screen
          name="Donate"
          component={FadeInDonate}
          options={{
            headerTitle: donateTitle
          }}
        />
        <Stack.Screen
          name="Help"
          component={FadeInHelp}
          options={{
            headerTitle: helpTitle
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default TabStackNavigator;
