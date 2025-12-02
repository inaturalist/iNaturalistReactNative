import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import { Subheading2 } from "components/SharedComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  observation: {
    private_place_guess?: string
  };
}

const SimpleObservationLocation = ( {
  observation
}: Props ) => {
  const { t } = useTranslation( );
  const displayLocation = checkCamelAndSnakeCase(
    observation,
    observation.private_place_guess
      ? "privatePlaceGuess"
      : "placeGuess"
  );

  if ( !observation ) {
    return null;
  }

  return (
    <Subheading2
      className="text-darkGray"
      ellipsizeMode="tail"
      accessible
      accessibilityLabel={t( "Location" )}
      accessibilityValue={{
        text: displayLocation
      }}
    >
      {displayLocation}
    </Subheading2>
  );
};

export default SimpleObservationLocation;
