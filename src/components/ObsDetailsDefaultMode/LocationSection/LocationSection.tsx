import ObscurationExplanation from "components/ObsDetailsSharedComponents/DetailsTab/ObscurationExplanation";
import {
  DateDisplay,
  Heading5,
  List2,
  SimpleObservationLocation,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React from "react";
import type { RealmObservation } from "realmModels/types";
import { useCurrentUser } from "sharedHooks";

interface Props {
  belongsToCurrentUser: boolean;
  observation: RealmObservation;
}

const LocationSection = ( {
  belongsToCurrentUser,
  observation,
}: Props ) => {
  const currentUser = useCurrentUser( );
  const geoprivacy = observation?.geoprivacy;
  const taxonGeoprivacy = observation?.taxon_geoprivacy;
  const hasLocation = observation?.privateLatitude != null || observation?.latitude != null;

  return (
    <View className="py-1">
      <View className="m-4">
        {
          !hasLocation
            ? (
              <Heading5 className="mb-2">
                {t( "OBSERVED-AT--label" )}
              </Heading5>
            )
            : (
              <>
                <Heading5 className="mb-2">
                  {t( "OBSERVED-IN--label" )}
                </Heading5>
                <SimpleObservationLocation
                  observation={observation}
                />
              </>
            )
        }

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
              timeZone={observation.observed_time_zone}
            />
          </View>
        )}
        {observation?.obscured && (
          <ObscurationExplanation
            textClassName="mt-[10px]"
            observation={observation}
            currentUser={currentUser}
          />
        )}
      </View>
    </View>
  );
};

export default LocationSection;
