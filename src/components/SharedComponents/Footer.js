// @flow

import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { Pressable, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { viewStyles } from "../../styles/sharedComponents/footer";
import CameraOptionsButton from "./Buttons/CameraOptionsButton";

const Footer = ( ): React.Node => {
  const navigation = useNavigation( );
  const toggleSideMenu = ( ) => navigation.openDrawer( );
  const navToObsList = ( ) => navigation.navigate( "observations", { screen: "ObsList" } );
  const navToExplore = ( ) => navigation.navigate( "explore stack" );
  const navToNotifications = ( ) => navigation.navigate( "notifications" );

  return (
    <View style={[viewStyles.row, viewStyles.shadow]}>
      <Pressable onPress={toggleSideMenu} accessibilityRole="link">
        <Icon name="menu" size={30} />
      </Pressable>
      <Pressable onPress={navToExplore} accessibilityRole="link">
        <Icon name="web" size={30} />
      </Pressable>
      <CameraOptionsButton buttonType="footer" />
      <Pressable onPress={navToObsList} accessibilityRole="link">
        <Icon name="account" size={30} />
      </Pressable>
      <Pressable onPress={navToNotifications} accessibilityRole="link">
        <Icon name="bell" size={30} />
      </Pressable>
    </View>
  );
};

export default Footer;
