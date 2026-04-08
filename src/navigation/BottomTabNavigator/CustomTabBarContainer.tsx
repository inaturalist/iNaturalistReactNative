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

// Reset Menu and Notifications stacks when navigating away from them
const resetOnLeaveTabScreenTuples: [TabName, ScreenName][] = [
  ["MenuTab", SCREEN_NAME_MENU],
  ["NotificationsTab", SCREEN_NAME_NOTIFICATIONS],
];

const getActiveTab = ( activeTabName: TabName ): ScreenName => {
  switch ( activeTabName ) {
    case "MenuTab": return SCREEN_NAME_MENU;
    case "ExploreTab": return SCREEN_NAME_ROOT_EXPLORE;
    case "ObservationsTab": return SCREEN_NAME_OBS_LIST;
    case "NotificationsTab": return SCREEN_NAME_NOTIFICATIONS;
    default: return SCREEN_NAME_OBS_LIST;
  }
};

const CustomTabBarContainer: React.FC<Props> = ( { navigation, state } ) => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );

  const activeTabIndex = state?.index;
  const activeTabName = state?.routes[activeTabIndex]?.name as TabName;

  const userIconUri = useMemo( ( ) => User.thumbUri( currentUser ), [currentUser] );

  const activeTab = getActiveTab( activeTabName );

  const handleTabPress = useCallback( (
    targetTabName: TabName,
    targetScreenName: ScreenName,
  ) => {
    const navState = navigation.getState( );
    const newStacks: Partial<NavigationRoute<ParamListBase, string>>[]
      = navState.routes.slice();
    let needsReset = false;

    for ( const [tabName, screenName] of resetOnLeaveTabScreenTuples ) {
      if ( activeTabName === tabName && targetTabName !== tabName ) {
        const idx = newStacks.findIndex( r => r.name === activeTabName );
        newStacks.splice( idx, 1, {
          name: activeTabName,
          state: { index: 0, routes: [{ name: screenName }] },
        } );
        needsReset = true;
      }
    }

    // If pressing the currently active tab, reset its stack
    if ( targetTabName === activeTabName ) {
      const idx = newStacks.findIndex( r => r.name === targetTabName );
      newStacks.splice( idx, 1, {
        name: targetTabName,
        state: { index: 0, routes: [{ name: targetScreenName }] },
      } );
      needsReset = true;
    }

    if ( needsReset ) {
      const targetIndex = newStacks.findIndex( r => r.name === targetTabName );
      navigation.dispatch(
        CommonActions.reset( {
          index: 0,
          routes: [
            {
              name: "TabNavigator",
              state: {
                index: targetIndex,
                routes: newStacks,
              },
            },
          ],
        } ),
      );
    } else {
      navigation.navigate( targetTabName );
    }
  }, [navigation, activeTabName] );

  const tabs: TabConfig[] = useMemo( ( ) => ( [
    {
      icon: "hamburger-menu",
      testID: SCREEN_NAME_MENU,
      accessibilityLabel: t( "Menu" ),
      accessibilityHint: t( "Navigates-to-main-menu" ),
      size: 26,
      onPress: ( ) => handleTabPress( "MenuTab", SCREEN_NAME_MENU ),
      active: SCREEN_NAME_MENU === activeTab,
    },
    {
      icon: "magnifying-glass",
      testID: SCREEN_NAME_ROOT_EXPLORE,
      accessibilityLabel: t( "Explore" ),
      accessibilityHint: t( "Navigates-to-explore" ),
      size: 26,
      onPress: ( ) => handleTabPress( "ExploreTab", SCREEN_NAME_ROOT_EXPLORE ),
      active: SCREEN_NAME_ROOT_EXPLORE === activeTab,
    },
    {
      icon: "person",
      userIconUri,
      testID: "NavButton.personIcon",
      accessibilityLabel: t( "My-Observations--bottom-tab" ),
      accessibilityHint: t( "Navigates-to-your-observations" ),
      size: 32,
      onPress: ( ) => handleTabPress( "ObservationsTab", SCREEN_NAME_OBS_LIST ),
      active: SCREEN_NAME_OBS_LIST === activeTab,
    },
    {
      icon: "notifications-bell",
      testID: SCREEN_NAME_NOTIFICATIONS,
      accessibilityLabel: t( "Notifications--bottom-tab" ),
      accessibilityHint: t( "Navigates-to-notifications" ),
      size: 26,
      onPress: ( ) => handleTabPress( "NotificationsTab", SCREEN_NAME_NOTIFICATIONS ),
      active: SCREEN_NAME_NOTIFICATIONS === activeTab,
    },
  ] ), [
    activeTab,
    userIconUri,
    t,
    handleTabPress,
  ] );

  return (
    <CustomTabBar
      tabs={tabs}
    />
  );
};

export default CustomTabBarContainer;
