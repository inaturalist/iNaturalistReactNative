// @flow
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import { Heading2 } from "components/SharedComponents";
import type { Node } from "react";
import React, { useMemo } from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  observation: Object,
  handleLocationPickerPressed?: ( ) => void
};

const SimpleObservationLocation = ( {
  observation,
  handleLocationPickerPressed
}: Props ): Node => {
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
      accessibilityLabel={handleLocationPickerPressed
        ? t( "Edit-location" )
        : t( "Location" )}
      accessibilityValue={{
        text: displayLocation
      }}
      disabled={displayLocation !== null}
      onPress={( ) => {
        if ( handleLocationPickerPressed !== undefined ) {
          handleLocationPickerPressed( );
        }
      }}
    >
      {displayLocation}
    </Heading2>
  );
};

export default SimpleObservationLocation;
