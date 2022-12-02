// @flow

import { Pressable, Text } from "components/styledComponents";
import { t } from "i18next";
import { ExploreContext } from "providers/contexts";
import * as React from "react";
import { viewStyles } from "styles/observations/messagesIcon";

const ResetFiltersButton = ( ): React.Node => {
  const { resetFilters } = React.useContext( ExploreContext );

  return (
    <Pressable
      onPress={resetFilters}
      style={viewStyles.messages}
    >
      <Text>{t( "Reset" )}</Text>
    </Pressable>
  );
};

export default ResetFiltersButton;
