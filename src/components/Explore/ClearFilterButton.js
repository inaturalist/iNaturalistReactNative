// @flow

import * as React from "react";
import { Text, Pressable } from "react-native";

import { viewStyles } from "../../styles/observations/messagesIcon";
import { ExploreContext } from "../../providers/contexts";

const ClearFiltersButton = ( ): React.Node => {
  const { clearFilters } = React.useContext( ExploreContext );

  return (
    <Pressable
      onPress={clearFilters}
      style={viewStyles.messages}
    >
      <Text>clear</Text>
    </Pressable>
  );
};

export default ClearFiltersButton;
