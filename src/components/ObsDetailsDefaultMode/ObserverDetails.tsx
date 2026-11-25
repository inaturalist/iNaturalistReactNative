import classnames from "classnames";
import {
  DateDisplay,
  InlineUser,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import type { Geoprivacy } from "realmModels/geoprivacy";

interface Props {
  belongsToCurrentUser: boolean;
  isConnected: boolean;
  observation: {
    geoprivacy?: Geoprivacy;
    taxon_geoprivacy?: Geoprivacy;
    user: {
      id: number;
      icon_url?: string;
      login?: string;
    };
    time_observed_at?: string | null;
    observed_on_string?: string | null;
    observed_on?: string | null;
    observed_time_zone?: string | null;
  };
}

const ObserverDetails = ( {
  belongsToCurrentUser,
  isConnected,
  observation,
}: Props ) => {
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
              // TS errors: DateDisplay's props don't accept null or a missing date.
              // Fix when next touching DateDisplay; its date formatters already accept null.
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
