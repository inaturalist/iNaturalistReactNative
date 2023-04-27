// @flow

import {
  Body2, Heading5
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";

type Props = {
  user: Object
}

const UserCounts = ( { user }: Props ): React.Node => {
  const showCount = ( count, label ) => (
    <View className="w-1/4">
      <Body2 className="self-center">{count}</Body2>
      <Heading5 className="self-center">{label}</Heading5>
    </View>
  );

  return (
    <View className="flex-row mt-6">
      {showCount( user.observations_count, t( "OBSERVATIONS" ) )}
      {showCount( user.species_count, t( "SPECIES" ) )}
      {showCount( user.identifications_count, t( "IDENTIFICATIONS" ) )}
      {showCount( user.journal_posts_count, t( "JOURNAL-POSTS" ) )}
    </View>
  );
};

export default UserCounts;
