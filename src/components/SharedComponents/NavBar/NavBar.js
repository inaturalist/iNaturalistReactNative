// @flow
import { useDrawerStatus } from "@react-navigation/drawer";
import { useNavigation, useRoute } from "@react-navigation/native";
import classNames from "classnames";
import AddObsButton from "components/SharedComponents/Buttons/AddObsButton";
import { View } from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";
import { Platform } from "react-native";
import User from "realmModels/User";
import useCurrentUser from "sharedHooks/useCurrentUser";
import { viewStyles } from "styles/sharedComponents/footer";

import NavButton from "./NavButton";

// TODO: This is not future proof, if changed in main navigation it breaks here
const OBS_LIST_SCREEN_ID = "MyObservations";
const EXPLORE_SCREEN_ID = "Explore";
const MESSAGES_SCREEN_ID = "Messages";

const NavBar = ( ): React.Node => {
  const navigation = useNavigation( );
  const { name } = useRoute();
  const isDrawerOpen = useDrawerStatus() === "open";
  const toggleSideMenu = ( ) => navigation.openDrawer( );
  const navToObsList = ( ) => navigation.navigate( "MainStack", { screen: OBS_LIST_SCREEN_ID } );
  const navToExplore = ( ) => navigation.navigate( "MainStack", { screen: EXPLORE_SCREEN_ID } );
  const navToNotifications = ( ) => navigation.navigate( "MainStack", {
    screen: MESSAGES_SCREEN_ID
  } );

  const user = useCurrentUser( );

  const footerHeight = Platform.OS === "ios" ? "h-20" : "h-15";

  return (
    <View
      className={classNames(
        "flex flex-row absolute bottom-0 bg-white w-full justify-evenly items-center pb-2",
        footerHeight
      )}
      style={viewStyles.shadow}
      accessibilityRole="tablist"
    >
      <NavButton
        onPress={toggleSideMenu}
        icon="hamburger-menu"
        accessibilityRole="button"
        accessibilityLabel={t( "Open-drawer" )}
        accessibilityHint={t( "Opens-the-side-drawer-menu" )}
        testID="OPEN_DRAWER"
        active={isDrawerOpen}
        size={32}
      />
      <NavButton
        onPress={navToExplore}
        icon="compass-rose"
        testID={EXPLORE_SCREEN_ID}
        active={name === EXPLORE_SCREEN_ID}
        accessibilityLabel={t( "Explore" )}
        accessibilityHint={t( "Navigates-to-explore" )}
        size={40}
      />
      <AddObsButton />
      <NavButton
        onPress={navToObsList}
        icon="people"
        userIconUri={User.uri( user )}
        testID={OBS_LIST_SCREEN_ID}
        active={name === OBS_LIST_SCREEN_ID}
        accessibilityLabel={t( "Observations" )}
        accessibilityHint={t( "Navigates-to-observations" )}
        size={40}
      />
      <NavButton
        onPress={navToNotifications}
        icon="notifications-bell"
        active={name === MESSAGES_SCREEN_ID}
        testID={MESSAGES_SCREEN_ID}
        accessibilityLabel={t( "Messages" )}
        accessibilityHint={t( "Navigates-to-messages" )}
        size={32}
      />
    </View>
  );
};

export default NavBar;
