// @flow

import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { Pressable } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { viewStyles } from "styles/observations/messagesIcon";

const FiltersIcon = ( ): React.Node => {
  const navigation = useNavigation( );
  const navToExploreFilters = ( ) => navigation.navigate( "ExploreFilters" );

  return (
    <Pressable
      onPress={navToExploreFilters}
      style={viewStyles.messages}
    >
      <Icon name="filter-variant" size={35} />
    </Pressable>
  );
};

export default FiltersIcon;
