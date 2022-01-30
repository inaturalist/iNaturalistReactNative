// @flow

import * as React from "react";
import { Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { viewStyles } from "../../styles/observations/messagesIcon";

const FiltersIcon = ( ): React.Node => {
  const navigation = useNavigation( );
  const navToExploreFilters = ( ) => navigation.navigate( "ExploreFilters" );

  return (
    <Pressable
      onPress={navToExploreFilters}
      style={viewStyles.messages}
    >
      <Text>filters</Text>
    </Pressable>
  );
};

export default FiltersIcon;
