// @flow
import classnames from "classnames";
import {
  DateDisplay,
  InlineUser,
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
  observation,
}: Props ): Node => {
  const geoprivacy = observation?.geoprivacy;
  const taxonGeoprivacy = observation?.taxon_geoprivacy;

  const cardClass = "rounded-t-2xl border-lightGray border-[2px] mt-5 border-b-0 -mx-0.5";

  return (
    <View className="bg-white">
      <View className={classnames( cardClass )}>
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
              timeZone={observation.observed_time_zone}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default ObserverDetails;
