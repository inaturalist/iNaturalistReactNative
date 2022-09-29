// @flow

import TranslatedText from "components/SharedComponents/TranslatedText";
import { ExploreContext } from "providers/contexts";
import * as React from "react";
import { Pressable } from "react-native";
import { viewStyles } from "styles/observations/messagesIcon";

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
