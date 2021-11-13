// @flow

import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { viewStyles } from "../../styles/sharedComponents/footer";

const Footer = ( ): React.Node => {
  const navigation = useNavigation( );
  const toggleSideMenu = ( ) => navigation.openDrawer( );
  const navToObsList = ( ) => navigation.navigate( "my observations" );

  return (
    <View style={[viewStyles.row, viewStyles.shadow]}>
      <Pressable onPress={toggleSideMenu} accessibilityRole="link">
        <Text>menu</Text>
      </Pressable>
      <Pressable accessibilityRole="link">
        <Text>explore</Text>
      </Pressable>
      <Pressable accessibilityRole="link">
        <Text>camera</Text>
      </Pressable>
      <Pressable onPress={navToObsList} accessibilityRole="link">
        <Text>obs list</Text>
      </Pressable>
      <Pressable accessibilityRole="link">
        <Text>notifications</Text>
      </Pressable>
    </View>
  );
};

export default Footer;
