import classNames from "classnames";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import { Body4 } from "components/SharedComponents";
import ContentWithIcon from "components/SharedComponents/ObsDetails/ContentWithIcon";
import { View } from "components/styledComponents";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  classNameMargin?: string;
  details?: boolean; // Same as withCoordinates && withGeoprivacy
  observation: object;
  withCoordinates?: boolean;
  withGeoprivacy?: boolean;
}

const ObservationLocation = ( {
  classNameMargin,
  details,
  observation,
  withCoordinates,
  withGeoprivacy,
}: Props ) => {
  const { t } = useTranslation( );
  const geoprivacy = observation?.geoprivacy;
  const taxonGeoprivacy = observation?.taxon_geoprivacy;

  let displayLocation = useMemo(
    ( ) => checkCamelAndSnakeCase(
      observation,
      observation.private_place_guess
        ? "privatePlaceGuess"
        : "placeGuess",
    ),
    [observation],
  );

  const displayGeoprivacy = useMemo( ( ) => {
    if ( geoprivacy === "obscured" ) {
      return t( "Obscured" );
    } if ( geoprivacy === "private" ) {
      return t( "Private" );
    }
    return t( "Open" );
  }, [geoprivacy, t] );

  const displayCoords = useMemo( ( ) => {
    if (
      typeof ( observation?.latitude ) !== "number"
      && typeof ( observation.privateLatitude ) !== "number"
    ) return null;
    const accuracy = observation?.positional_accuracy?.toFixed( 0 ) || t( "none--accuracy" );
    if ( typeof ( observation.privateLatitude ) === "number" ) {
      return t( "Lat-Lon-Acc", {
        latitude: observation.privateLatitude,
        longitude: observation.privateLongitude,
        accuracy,
      } );
    }
    return t( "Lat-Lon-Acc", {
      latitude: observation.latitude,
      longitude: observation.longitude,
      accuracy,
    } );
  }, [observation, t] );

  if ( !displayLocation ) {
    if ( displayCoords && !details ) {
      displayLocation = displayCoords;
    } else {
      displayLocation = t( "No-Location" );
    }
  }
  const showGeoprivacy = useCallback( ( ) => {
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
    const geoprivacyInner = (
      <View className="flex-row space-x-[2px]">
        <Body4
          className="text-darkGray"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {t( "Geoprivacy-status", { status: t( displayPrivacy ) } )}
        </Body4>
      </View>
    );
    return (
      <ContentWithIcon icon="globe-outline" size={14} classNameMargin="mt-[11px]">
        { geoprivacyInner }
      </ContentWithIcon>
    );
  }, [
    displayGeoprivacy,
    t,
  ] );

  const inner = useMemo( ( ) => (
    <View className="flex-col space-y-[11px]">
      <Body4
        className="text-darkGray"
        ellipsizeMode="tail"
      >
        {displayLocation}
      </Body4>
      {( ( details || withCoordinates ) && displayCoords )
       && (
         <Body4
           className="text-darkGray"
           numberOfLines={1}
           ellipsizeMode="tail"
         >
           {displayCoords}
         </Body4>
       )}
    </View>
  ), [
    details,
    displayCoords,
    displayLocation,
    withCoordinates,
  ] );

  const locationIcon = () => {
    if ( geoprivacy === "private" || taxonGeoprivacy === "private" ) {
      return "private";
    }
    if ( geoprivacy === "obscured" || taxonGeoprivacy === "obscured" ) {
      return "obscured";
    }
    return "location";
  };

  if ( !observation ) {
    return null;
  }

  return (
    <View
      className={classNames( "flex flex-col", classNameMargin )}
      accessible
      accessibilityLabel={t( "Location" )}
      accessibilityValue={{
        text: displayLocation,
      }}
    >
      <ContentWithIcon icon={locationIcon()} size={13}>{ inner }</ContentWithIcon>
      {( details || withGeoprivacy ) && showGeoprivacy()}
    </View>
  );
};

export default ObservationLocation;
