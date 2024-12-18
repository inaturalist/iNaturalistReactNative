// @flow
import {
  DateDisplay,
  InlineUser
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  belongsToCurrentUser: boolean,
  isConnected: boolean,
  observation: Object,
}

const ObserverDetails = ( {
  belongsToCurrentUser,
  isConnected,
  observation
}: Props ): Node => {
  const geoprivacy = observation?.geoprivacy;
  const taxonGeoprivacy = observation?.taxon_geoprivacy;

  return (
    <View className="bg-white">
      <View className="flex-row justify-between mx-[15px] my-[13px]">
        <InlineUser user={observation?.user} isConnected={isConnected} />
        {observation && (
          <DateDisplay
            dateString={
              observation.time_observed_at
              || observation.observed_on_string
              || observation.observed_on
            }
            geoprivacy={geoprivacy}
            taxonGeoprivacy={taxonGeoprivacy}
            belongsToCurrentUser={belongsToCurrentUser}
            maxFontSizeMultiplier={1}
          />
        )}
      </View>
    </View>
  );
};

export default ObserverDetails;
