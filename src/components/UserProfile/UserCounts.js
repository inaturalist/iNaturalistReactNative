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

const Count = ( { count, label } ) => (
  <View className="w-1/4">
    <Body2 className="self-center">{t( "Intl-number", { val: count } )}</Body2>
    <Heading5 className="self-center">{label}</Heading5>
  </View>
);

const UserCounts = ( { user }: Props ): React.Node => (
  <View className="flex-row mt-6">
    <Count
      count={user.observations_count}
      label={t( "OBSERVATIONS-WITHOUT-NUMBER", { count: user.observations_count } )}
    />
    <Count
      count={user.species_count}
      label={t( "SPECIES-WITHOUT-NUMBER", { count: user.species_count } )}
    />
    <Count
      count={user.identifications_count}
      label={t( "IDENTIFICATIONS-WITHOUT-NUMBER", { count: user.identifications_count } )}
    />
    <Count
      count={user.journal_posts_count}
      label={t( "JOURNAL-POSTS-WITHOUT-NUMBER", { count: user.journal_posts_count } )}
    />
  </View>
);

export default UserCounts;
