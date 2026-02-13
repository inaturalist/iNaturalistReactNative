import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { NavigationRoute, ParamListBase } from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";
import {
  SCREEN_NAME_MENU,
  SCREEN_NAME_NOTIFICATIONS,
  SCREEN_NAME_OBS_LIST,
  SCREEN_NAME_ROOT_EXPLORE,
} from "navigation/StackNavigators/TabStackNavigator";
import React, { useCallback, useMemo } from "react";
import User from "realmModels/User";
import { useCurrentUser, useTranslation } from "sharedHooks";

import CustomTabBar from "./CustomTabBar";

interface TabConfig {
  icon: string;
  testID: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  size: number;
  onPress: () => void;
  active: boolean;
  userIconUri?: string;
}

type TabName = "MenuTab" | "ExploreTab" | "ObservationsTab" | "NotificationsTab";

type ScreenName =
  | typeof SCREEN_NAME_MENU
  | typeof SCREEN_NAME_ROOT_EXPLORE
  | typeof SCREEN_NAME_OBS_LIST
  | typeof SCREEN_NAME_NOTIFICATIONS;

type Props = BottomTabBarProps;

const CustomTabBarContainer: React.FC<Props> = ( { navigation, state } ) => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );

  const activeTabIndex = state?.index;
  const activeTabName = state?.routes[activeTabIndex]?.name as TabName;

  const userIconUri = useMemo( ( ) => User.uri( currentUser ), [currentUser] );

  const getActiveTab = ( ): ScreenName => {
    switch ( activeTabName ) {
      case "MenuTab": return SCREEN_NAME_MENU;
      case "ExploreTab": return SCREEN_NAME_ROOT_EXPLORE;
      case "ObservationsTab": return SCREEN_NAME_OBS_LIST;
      case "NotificationsTab": return SCREEN_NAME_NOTIFICATIONS;
      default: return SCREEN_NAME_OBS_LIST;
    }
  };

  const resetStack = useCallback( ( tabName: TabName, screenName: ScreenName ) => {
    const navState = navigation.getState( );
    // copy existing stack routes so we don't lose state for tabs we're not resetting
    const newStacks: Partial<NavigationRoute<ParamListBase, string>>[]
    = navState.routes.slice();
    const replaceIndex = newStacks.findIndex( r => r.name === tabName );
    // add reset stack
    newStacks.splice( replaceIndex, 1, {
      name: tabName,
      state: {
        index: 0,
        routes: [
          { name: screenName },
        ],
      },
    } );

    navigation.dispatch(
      CommonActions.reset( {
        index: 0,
        routes: [
          {
            name: "TabNavigator",
            state: {
              index: navState.index,
              routes: newStacks,
            },
          },
        ],
      } ),
    );
  }, [navigation] );

  const activeTab = getActiveTab( );

  const tabs: TabConfig[] = useMemo( ( ) => ( [
    {
      icon: "hamburger-menu",
      testID: SCREEN_NAME_MENU,
      accessibilityLabel: t( "Menu" ),
      accessibilityHint: t( "Navigates-to-main-menu" ),
      size: 32,
      onPress: ( ) => {
        const isCurrentTab = SCREEN_NAME_MENU === activeTab;
        if ( isCurrentTab ) {
          // Reset stack to initial route when tapping active tab
          resetStack( "MenuTab", SCREEN_NAME_MENU );
        } else {
          navigation.navigate( "MenuTab" );
        }
      },
      active: SCREEN_NAME_MENU === activeTab,
    },
    {
      icon: "magnifying-glass",
      testID: SCREEN_NAME_ROOT_EXPLORE,
      accessibilityLabel: t( "Explore" ),
      accessibilityHint: t( "Navigates-to-explore" ),
      size: 31,
      onPress: ( ) => {
        const isCurrentTab = SCREEN_NAME_ROOT_EXPLORE === activeTab;
        if ( isCurrentTab ) {
          // Reset stack to initial route when tapping active tab
          resetStack( "ExploreTab", SCREEN_NAME_ROOT_EXPLORE );
        } else {
          navigation.navigate( "ExploreTab" );
        }
      },
      active: SCREEN_NAME_ROOT_EXPLORE === activeTab,
    },
    {
      icon: "person",
      userIconUri,
      testID: "NavButton.personIcon",
      accessibilityLabel: t( "My-Observations--bottom-tab" ),
      accessibilityHint: t( "Navigates-to-your-observations" ),
      size: 40,
      onPress: ( ) => {
        const isCurrentTab = SCREEN_NAME_OBS_LIST === activeTab;
        if ( isCurrentTab ) {
          // Reset stack to initial route when tapping active tab
          resetStack( "ObservationsTab", SCREEN_NAME_OBS_LIST );
        } else {
          navigation.navigate( "ObservationsTab" );
        }
      },
      active: SCREEN_NAME_OBS_LIST === activeTab,
    },
    {
      icon: "notifications-bell",
      testID: SCREEN_NAME_NOTIFICATIONS,
      accessibilityLabel: t( "Notifications--bottom-tab" ),
      accessibilityHint: t( "Navigates-to-notifications" ),
      size: 32,
      onPress: ( ) => {
        const isCurrentTab = SCREEN_NAME_NOTIFICATIONS === activeTab;
        if ( isCurrentTab ) {
          // Reset stack to initial route when tapping active tab
          resetStack( "NotificationsTab", SCREEN_NAME_NOTIFICATIONS );
        } else {
          navigation.navigate( "NotificationsTab" );
        }
      },
      active: SCREEN_NAME_NOTIFICATIONS === activeTab,
    },
  ] ), [
    activeTab,
    userIconUri,
    navigation,
    t,
    resetStack,
  ] );

  return (
    <CustomTabBar
      tabs={tabs}
    />
  );
};

export default CustomTabBarContainer;
