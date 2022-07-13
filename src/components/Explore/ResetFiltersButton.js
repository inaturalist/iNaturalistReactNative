// @flow

import * as React from "react";
import { Pressable } from "react-native";

import { ExploreContext } from "../../providers/contexts";
import { viewStyles } from "../../styles/observations/messagesIcon";
import TranslatedText from "../SharedComponents/TranslatedText";

const ResetFiltersButton = ( ): React.Node => {
  const { resetFilters } = React.useContext( ExploreContext );

  return (
    <Pressable
      onPress={resetFilters}
      style={viewStyles.messages}
    >
      <TranslatedText text="Reset" />
    </Pressable>
  );
};

export default ResetFiltersButton;
