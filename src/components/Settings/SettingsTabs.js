// @flow

import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { viewStyles } from "../../styles/settings/settingsTabs";

const SettingsTab = ( ): React.Node => {
  const navigation = useNavigation( );
  const navToProfile = ( ) => navigation.navigate( "explore stack" );

  return (
    <>
      <View style={[viewStyles.tabsRow, viewStyles.shadow]}>
        <Pressable onPress={navToProfile} accessibilityRole="link">
          <Text>profile</Text>
        </Pressable>
        <Pressable onPress={navToProfile} accessibilityRole="link">
          <Text>account</Text>
        </Pressable>
        <Pressable onPress={navToProfile} accessibilityRole="link">
          <Text>notifications</Text>
        </Pressable>
        <Pressable onPress={navToProfile} accessibilityRole="link">
          <Text>relationships</Text>
        </Pressable>
        <Pressable onPress={navToProfile} accessibilityRole="link">
          <Text>content&display</Text>
        </Pressable>
        <Pressable onPress={navToProfile} accessibilityRole="link">
          <Text>applications</Text>
        </Pressable>
      </View>
    </>
  );
};

export default SettingsTab;
