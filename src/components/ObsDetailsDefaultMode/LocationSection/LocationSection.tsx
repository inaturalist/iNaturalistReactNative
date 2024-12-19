import classnames from "classnames";
import {
  DateDisplay,
  Heading5,
  List2,
  SimpleObservationLocation
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React from "react";
import Observation from "realmModels/Observation";
import { useCurrentUser } from "sharedHooks";

import ObscurationExplanation from "./ObscurationExplanation";

interface Props {
  belongsToCurrentUser: boolean,
  observation: Observation
}

const LocationSection = ( { belongsToCurrentUser, observation }: Props ) => {
  const currentUser = useCurrentUser( );
  const geoprivacy = observation?.geoprivacy;
  const taxonGeoprivacy = observation?.taxon_geoprivacy;

  const cardClass = "rounded-b-2xl border-lightGray border-[2px] pb-3 border-t-0 -mx-0.5";

  return (
    <View className="pt-1 pb-5">
      <View className="m-4">
        <Heading5 className="mb-2">
          {t( "OBSERVED-IN--label" )}
        </Heading5>
        <SimpleObservationLocation observation={observation} />
        {observation.obscured && (
          <ObscurationExplanation
            textClassName="ml-[20px] mt-[10px]"
            observation={observation}
            currentUser={currentUser}
          />
        ) }
        {observation && (
          <View className="mt-2">
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
              hideIcon
              textComponent={List2}
            />
          </View>
        )}
      </View>
      <View className={classnames( cardClass )} />
    </View>
  );
};

export default LocationSection;
