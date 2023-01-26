// @flow
import { useNavigation } from "@react-navigation/native";
import { Pressable, View } from "components/styledComponents";
import * as React from "react";
import { Platform } from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import { viewStyles } from "styles/sharedComponents/footer";

import AddObsButton from "./Buttons/AddObsButton";

const Footer = ( ): React.Node => {
  const navigation = useNavigation( );
  const toggleSideMenu = ( ) => navigation.openDrawer( );
  const navToObsList = ( ) => navigation.navigate( "MainStack", { screen: "ObsList" } );
  const navToExplore = ( ) => navigation.navigate( "MainStack", { screen: "ExploreLanding" } );
  const navToNotifications = ( ) => navigation.navigate( "MainStack", { screen: "Messages" } );

  const footerClassName = ( Platform.OS === "ios" )
    ? "flex-row h-20 absolute bottom-0 bg-white w-full justify-evenly pt-2"
    : "flex-row h-14 absolute bottom-0 bg-white w-full justify-evenly pt-2";

  return (
    <View
      className={footerClassName}
      style={viewStyles.shadow}
    >
      <Pressable testID="footer-menu-button" onPress={toggleSideMenu} accessibilityRole="link">
        <IconMaterial name="menu" size={30} />
      </Pressable>
      <Pressable onPress={navToExplore} accessibilityRole="link">
        <IconMaterial name="language" size={30} />
      </Pressable>
      <AddObsButton />
      <Pressable onPress={navToObsList} accessibilityRole="link">
        <IconMaterial name="person" size={30} />
      </Pressable>
      <Pressable onPress={navToNotifications} accessibilityRole="link">
        <IconMaterial name="notifications" size={30} />
      </Pressable>
    </View>
  );
};

export default Footer;
