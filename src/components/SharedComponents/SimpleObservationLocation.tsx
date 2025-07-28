import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import { Heading2 } from "components/SharedComponents";
import React, { useMemo } from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  observation: object;
}

const SimpleObservationLocation = ( {
  observation
}: Props ) => {
  const { t } = useTranslation( );

  const displayLocation = useMemo(
    ( ) => checkCamelAndSnakeCase(
      observation,
      observation.private_place_guess
        ? "privatePlaceGuess"
        : "placeGuess"
    ),
    [observation]
  );

  if ( !observation ) {
    return null;
  }

  return (
    <Heading2
      className="text-darkGray"
      ellipsizeMode="tail"
      accessible
      accessibilityLabel={t( "Location" )}
      accessibilityValue={{
        text: displayLocation
      }}
    >
      {displayLocation}
    </Heading2>
  );
};

export default SimpleObservationLocation;
