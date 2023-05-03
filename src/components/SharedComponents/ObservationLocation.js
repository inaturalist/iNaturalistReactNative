// @flow
import classNames from "classnames";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import { Body4, INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  observation: Object,
  classNameMargin?: string,
  details?:boolean
};

const ObservationLocation = ( { observation, classNameMargin, details }: Props ): React.Node => {
  const { t } = useTranslation( );

  let displayLocation = checkCamelAndSnakeCase( observation, "placeGuess" );
  let displayCoords = "";
  const geoprivacy = checkCamelAndSnakeCase( observation, "geoprivacy" );

  if ( !displayLocation ) {
    displayLocation = t( "No-Location" );
  }
  if ( ( observation?.latitude !== null && observation?.latitude !== undefined )
    && ( observation?.longitude != null && observation?.longitude !== undefined )
  ) {
    displayCoords = `Lat: ${observation.latitude}, Lon: ${observation.longitude}`;
  }

  const displayGeoprivacy = ( ) => (
    <View className="flex-row mt-[11px]">
      <INatIcon name="globe-outline" size={14} />
      <Body4
        className="text-darkGray ml-[5px]"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {geoprivacy}
      </Body4>
    </View>
  );

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
        <Body4
          className="text-darkGray ml-[8px]"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {displayLocation}
        </Body4>
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
