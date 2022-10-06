// @flow

import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { Pressable } from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

import { viewStyles } from "../../styles/observations/messagesIcon";

const FiltersIcon = ( ): React.Node => {
  const navigation = useNavigation( );
  const navToExploreFilters = ( ) => navigation.navigate( "ExploreFilters" );

  return (
    <Pressable
      onPress={navToExploreFilters}
      style={viewStyles.messages}
    >
      <IconMaterial name="filter-list" size={35} />
    </Pressable>
  );
};

export default FiltersIcon;
