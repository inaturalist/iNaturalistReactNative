// @flow
import classNames from "classnames";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import { Body3, Body4, INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { capitalize } from "lodash";
import * as React from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  observation: Object,
  classNameMargin?: string,
  details?: boolean,
  large?: boolean
};

const ObservationLocation = ( {
  observation, classNameMargin, details, large
}: Props ): React.Node => {
  const { t } = useTranslation( );

  let displayLocation = checkCamelAndSnakeCase( observation, "placeGuess" );
  let displayCoords;
  const geoprivacy = capitalize( checkCamelAndSnakeCase( observation, "geoprivacy" ) );
  const isObscured = geoprivacy === "Obscured";

  if ( !displayLocation ) {
    displayLocation = t( "No-Location" );
    if ( geoprivacy === "Private" ) {
      displayLocation = t( "Private" );
    }
  }
  if ( ( observation?.latitude !== null && observation?.latitude !== undefined )
    && ( observation?.longitude != null && observation?.longitude !== undefined )
    && !isObscured
  ) {
    displayCoords = t( "Lat-Lon-Acc", {
      latitude: observation.latitude,
      longitude: observation.longitude,
      accuracy: observation?.positional_accuracy?.toFixed( 0 ) || t( "none" )
    } );
  }

  const displayGeoprivacy = ( ) => (
    <View className="flex-row mt-[11px]">
      <INatIcon name="globe-outline" size={14} />
      <Body4
        className="text-darkGray ml-[5px]"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {t( "Geoprivacy" )}
      </Body4>
      <Body4
        className="text-darkGray ml-[5px]"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {t( geoprivacy )}
      </Body4>
    </View>
  );

  const TextComponent = large
    ? Body3
    : Body4;

  return (
    <View
      className={classNames( "flex flex-col", classNameMargin )}
      accessible
      accessibilityLabel={t( "Location" )}
      accessibilityValue={{
        text: displayLocation
      }}
    >
      <View className="flex-row">
        <INatIcon name="location" size={15} />
        <TextComponent
          className="text-darkGray ml-[8px]"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {displayLocation}
        </TextComponent>
      </View>
      {details
        && (
          <View className="flex-col">
            {displayCoords && (
              <Body4
                className="text-darkGray ml-[23px] mt-[12px]"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {displayCoords}
              </Body4>
            )}
            {geoprivacy && displayGeoprivacy()}
          </View>
        )}
    </View>
  );
};

export default ObservationLocation;
