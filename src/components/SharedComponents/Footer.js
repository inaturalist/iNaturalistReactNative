// @flow
import { useNavigation } from "@react-navigation/native";
import { View } from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";
import { Platform } from "react-native";
import { IconButton } from "react-native-paper";
import { viewStyles } from "styles/sharedComponents/footer";

import AddObsButton from "./Buttons/AddObsButton";

const Footer = ( ): React.Node => {
  const navigation = useNavigation( );
  const toggleSideMenu = ( ) => navigation.openDrawer( );
  const navToObsList = ( ) => navigation.navigate( "MainStack", { screen: "ObsList" } );
  const navToExplore = ( ) => navigation.navigate( "MainStack", { screen: "Explore" } );
  const navToNotifications = ( ) => navigation.navigate( "MainStack", { screen: "Messages" } );

  const footerClassName = ( Platform.OS === "ios" )
    ? "flex-row h-20 absolute bottom-0 bg-white w-full justify-evenly pt-2"
    : "flex-row h-14 absolute bottom-0 bg-white w-full justify-evenly pt-2";

  return (
    <View
      className={footerClassName}
      style={viewStyles.shadow}
    >
      <IconButton
        icon="hamburger-menu"
        onPress={toggleSideMenu}
        accessibilityLabel={t( "Open-side-menu" )}
        disabled={false}
      />
      <IconButton
        icon="compass-rose"
        onPress={navToExplore}
        accessibilityLabel={t( "Navigate-to-explore-screen" )}
        disabled={false}
      />
      <AddObsButton />
      <IconButton
        icon="ios-people-updated-2"
        onPress={navToObsList}
        accessibilityLabel={t( "Navigate-to-observation-list" )}
        disabled={false}
      />
      <IconButton
        icon="notifications-bell"
        onPress={navToNotifications}
        accessibilityLabel={t( "Navigate-to-notifications-screen" )}
        disabled={false}
      />
    </View>
  );
};

export default Footer;
