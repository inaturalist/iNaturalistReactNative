// @flow
import classNames from "classnames";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import { Body3, Body4 } from "components/SharedComponents";
import ContentWithIcon from "components/SharedComponents/ObsDetails/ContentWithIcon";
import { View } from "components/styledComponents";
import * as React from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  observation: Object,
  obscured?: boolean,
  classNameMargin?: string,
  details?: boolean,
  large?: boolean
};

const ObservationLocation = ( {
  observation, classNameMargin, details, large, obscured
}: Props ): React.Node => {
  const { t } = useTranslation( );
  let displayLocation = checkCamelAndSnakeCase( observation, "placeGuess" );
  let displayCoords;
  const displayGeoprivacy = checkCamelAndSnakeCase( observation, "geoprivacy" );

  const TextComponent = large
    ? Body3
    : Body4;

  if ( ( observation?.latitude !== null && observation?.latitude !== undefined )
    && ( observation?.longitude != null && observation?.longitude !== undefined )
    && !obscured
  ) {
    displayCoords = t( "Lat-Lon-Acc", {
      latitude: observation.latitude,
      longitude: observation.longitude,
      accuracy: observation?.positional_accuracy?.toFixed( 0 ) || t( "none" )
    } );
  }
  if ( ( observation?.privateLatitude !== null && observation?.privateLatitude !== undefined )
  && ( observation?.privateLongitude != null && observation?.privateLongitude !== undefined )
  && !obscured
  ) {
    displayCoords = t( "Lat-Lon-Acc", {
      latitude: observation.privateLatitude,
      longitude: observation.privateLongitude,
      accuracy: observation?.positional_accuracy?.toFixed( 0 ) || t( "none" )
    } );
  }
  if ( !displayLocation ) {
    if ( displayCoords && !details ) {
      displayLocation = displayCoords;
    } else {
      displayLocation = t( "No-Location" );
    }
  }

  const showGeoprivacy = ( ) => {
    let displayPrivacy = displayGeoprivacy;
    if ( displayPrivacy === "private" ) {
      displayPrivacy = "Private";
    }
    if ( displayPrivacy === "obscured" ) {
      displayPrivacy = "Obscured";
    }
    if ( displayPrivacy === null || displayPrivacy === "open" ) {
      displayPrivacy = "Open";
    }
    return (

      <ContentWithIcon icon="globe-outline" size={14} classNameMargin="mt-[11px]">
        <View className="flex-row space-x-[2px]">
          <TextComponent
            className="text-darkGray"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {t( "Geoprivacy" )}
          </TextComponent>
          <TextComponent
            className="text-darkGray"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {t( displayPrivacy )}
          </TextComponent>
        </View>
      </ContentWithIcon>
    );
  };

  return (
    <View
      className={classNames( "flex flex-col", classNameMargin )}
      accessible
      accessibilityLabel={t( "Location" )}
      accessibilityValue={{
        text: displayLocation
      }}
    >
      <ContentWithIcon icon="location" size={14}>
        <View className="flex-col space-y-[11px]">
          <TextComponent
            className="text-darkGray"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayLocation}
          </TextComponent>
          {( details && displayCoords )
           && (
             <TextComponent
               className="text-darkGray"
               numberOfLines={1}
               ellipsizeMode="tail"
             >
               {displayCoords}
             </TextComponent>
           )}
        </View>
      </ContentWithIcon>
      {details
        && showGeoprivacy()}
    </View>
  );
};

export default ObservationLocation;
