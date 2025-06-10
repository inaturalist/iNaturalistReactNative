import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useDrawerStatus } from "@react-navigation/drawer";
import {
  SCREEN_NAME_NOTIFICATIONS,
  SCREEN_NAME_OBS_LIST,
  SCREEN_NAME_ROOT_EXPLORE
} from "navigation/StackNavigators/TabStackNavigator";
import React, { useMemo } from "react";
import User from "realmModels/User.ts";
import { useCurrentUser, useTranslation } from "sharedHooks";

import CustomTabBar from "./CustomTabBar";

const DRAWER_ID = "OPEN_DRAWER";

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

type TabName = "ObservationsTab" | "ExploreTab" | "NotificationsTab";

type ScreenName =
  | typeof SCREEN_NAME_OBS_LIST
  | typeof SCREEN_NAME_ROOT_EXPLORE
  | typeof SCREEN_NAME_NOTIFICATIONS;

type Props = BottomTabBarProps;

const CustomTabBarContainer: React.FC<Props> = ( { navigation, state } ) => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );
  const isDrawerOpen = useDrawerStatus() === "open";

  const activeTabIndex = state?.index;
  const activeTabName = state?.routes[activeTabIndex]?.name as TabName;

  const userIconUri = useMemo( ( ) => User.uri( currentUser ), [currentUser] );

  const getActiveTab = ( ): ScreenName => {
    switch ( activeTabName ) {
      case "ObservationsTab": return SCREEN_NAME_OBS_LIST;
      case "ExploreTab": return SCREEN_NAME_ROOT_EXPLORE;
      case "NotificationsTab": return SCREEN_NAME_NOTIFICATIONS;
      default: return SCREEN_NAME_OBS_LIST;
    }
  };

  const activeTab = getActiveTab( );

  const tabs: TabConfig[] = useMemo( ( ) => ( [
    {
      icon: "hamburger-menu",
      testID: DRAWER_ID,
      accessibilityLabel: t( "Menu" ),
      accessibilityHint: t( "Opens-the-side-drawer-menu" ),
      size: 32,
      onPress: ( ) => {
        navigation.openDrawer( );
      },
      active: isDrawerOpen
    },
    {
      icon: "magnifying-glass",
      testID: SCREEN_NAME_ROOT_EXPLORE,
      accessibilityLabel: t( "Explore" ),
      accessibilityHint: t( "Navigates-to-explore" ),
      size: 31,
      onPress: ( ) => {
        navigation.navigate( "ExploreTab", {
          screen: "RootExplore"
        } );
      },
      active: SCREEN_NAME_ROOT_EXPLORE === activeTab
    },
    {
      icon: "person",
      userIconUri,
      testID: "NavButton.personIcon",
      accessibilityLabel: t( "My-Observations--bottom-tab" ),
      accessibilityHint: t( "Navigates-to-your-observations" ),
      size: 40,
      onPress: ( ) => {
        navigation.navigate( "ObservationsTab", {
          screen: "ObsList"
        } );
      },
      active: SCREEN_NAME_OBS_LIST === activeTab
    },
    {
      icon: "notifications-bell",
      testID: SCREEN_NAME_NOTIFICATIONS,
      accessibilityLabel: t( "Notifications--bottom-tab" ),
      accessibilityHint: t( "Navigates-to-notifications" ),
      size: 32,
      onPress: ( ) => {
        navigation.navigate( "NotificationsTab", {
          screen: "Notifications"
        } );
      },
      active: SCREEN_NAME_NOTIFICATIONS === activeTab
    }
  ] ), [
    activeTab,
    userIconUri,
    isDrawerOpen,
    navigation,
    t
  ] );

  return (
    <CustomTabBar
      tabs={tabs}
    />
  );
};

export default CustomTabBarContainer;
