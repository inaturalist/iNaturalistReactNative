// @flow

import Clipboard from "@react-native-clipboard/clipboard";
import DetailsMap from "components/ObsDetails/DetailsTab/DetailsMap";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import { t } from "i18next";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import openMap from "react-native-open-maps";

type Props = {
  observation: Object,
  latitude: number,
  longitude: number,
  closeModal: Function,
  obscured: bool,
  tileMapParams: ?Object
}

const DetailsMapContainer = ( {
  observation, latitude, longitude, closeModal, obscured, tileMapParams
}: Props ): Node => {
  const coordinateString = t( "Lat-Lon", {
    latitude,
    longitude
  } );

  const [showNotificationModal, setShowNotificationModal] = useState( false );
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

  const closeShowNotificationModal = () => {
    setShowNotificationModal( false );
  };
  const copyCoordinates = () => {
    Clipboard.setString( coordinateString );
    setShowNotificationModal( true );
    // notification disappears after 2 secs
    setTimeout( closeShowNotificationModal, 2000 );
  };

  const shareMap = () => {
    // takes in a provider prop but opens in browser instead of in app(google maps on iOS)
    openMap( { query: `${latitude}, ${longitude}` } );
  };

  const mapViewRef = useRef<any>( null );

  return (
    <DetailsMap
      mapViewRef={mapViewRef}
      latitude={latitude}
      longitude={longitude}
      obscured={obscured}
      positionalAccuracy={observation.positional_accuracy}
      displayLocation={displayLocation}
      displayCoordinates={displayCoordinates}
      copyCoordinates={copyCoordinates}
      shareMap={shareMap}
      showNotificationModal={showNotificationModal}
      closeNotificationsModal={closeShowNotificationModal}
      closeModal={closeModal}
      tileMapParams={tileMapParams}
    />
  );
};

export default DetailsMapContainer;
