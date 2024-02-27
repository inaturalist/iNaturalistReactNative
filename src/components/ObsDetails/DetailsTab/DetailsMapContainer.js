// @flow

import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import {
  Body2,
  Body4
} from "components/SharedComponents";
import DetailsMap from "components/SharedComponents/DetailsMap";
import {
  View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useRef } from "react";

type Props = {
  observation: Object,
  latitude: number,
  longitude: number,
  closeModal: Function,
  obscured: bool,
  tileMapParams: ?Object
}

const DetailsMapHeader = ( {
  displayLocation,
  displayCoordinates,
  obscured
} ) => (
  <View className="flex-col">
    <Body2
      className="text-darkGray"
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {displayLocation}
    </Body2>

    <Body2
      className="text-darkGray"
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {displayCoordinates}
    </Body2>
    {obscured && (
      <Body4 className="italic">
        {t( "Obscured-observation-location-map-description" )}
      </Body4>
    ) }
  </View>
);

const DetailsMapContainer = ( {
  observation, latitude, longitude, closeModal, obscured, tileMapParams
}: Props ): Node => {
  const coordinateString = t( "Lat-Lon", {
    latitude,
    longitude
  } );

  const displayCoordinates = t( "Lat-Lon-Acc", {
    latitude,
    longitude,
    accuracy: observation?.positional_accuracy?.toFixed( 0 ) || t( "none" )
  } );
  let displayLocation = (
    checkCamelAndSnakeCase( observation, "placeGuess" )
    || checkCamelAndSnakeCase( observation, "privatePlaceGuess" )
  );

  if ( !displayLocation ) {
    displayLocation = t( "No-Location" );
  }

  const mapViewRef = useRef<any>( null );

  return (
    <DetailsMap
      mapViewRef={mapViewRef}
      latitude={latitude}
      longitude={longitude}
      obscured={obscured}
      coordinateString={coordinateString}
      closeModal={closeModal}
      positionalAccuracy={observation.positional_accuracy}
      tileMapParams={tileMapParams}
      showLocationIndicator
      headerTitle={(
        <DetailsMapHeader
          displayCoordinates={displayCoordinates}
          displayLocation={displayLocation}
          obscured={obscured}
        />
      )}
    />
  );
};

export default DetailsMapContainer;
