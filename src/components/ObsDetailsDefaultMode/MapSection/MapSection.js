import {
  DetailsMap,
  Map,
  Modal
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React, { useCallback, useMemo, useState } from "react";
import Observation from "realmModels/Observation";
import { useCurrentUser } from "sharedHooks";

import DetailsMapHeader from "./DetailsMapHeader";

interface Props {
  observation: Observation,
  taxon?: Object
}

const DETAILS_MAP_MODAL_STYLE = { margin: 0 };

const MapSection = ( { observation, taxon }: Props ) => {
  const currentUser = useCurrentUser( );
  const [showMapModal, setShowMapModal] = useState( false );
  const latitude = observation.privateLatitude || observation.latitude;
  const longitude = observation.privateLongitude || observation.privateLongitude;
  const coordinateString = t( "Lat-Lon", {
    latitude,
    longitude
  } );

  const openMapScreen = useCallback( ( ) => setShowMapModal( true ), [] );

  const taxonId = taxon?.id || observation?.taxon?.id;

  const tileMapParams = useMemo( ( ) => ( taxonId
    ? {
      taxon_id: taxonId,
      verifiable: true
    }
    : null ), [taxonId] );

  const showModalMap = useMemo( ( ) => (
    <DetailsMap
      coordinateString={coordinateString}
      closeModal={( ) => setShowMapModal( false )}
      observation={observation}
      tileMapParams={tileMapParams}
      withObsTiles={tileMapParams !== null}
      showLocationIndicator
      headerTitle={(
        <DetailsMapHeader currentUser={currentUser} observation={observation} />
      )}
    />
  ), [
    coordinateString,
    currentUser,
    observation,
    tileMapParams
  ] );

  if ( !latitude ) {
    return null;
  }

  return (
    <View className="h-[230px]">
      <Map
        mapHeight={230}
        observation={observation}
        openMapScreen={openMapScreen}
        scrollEnabled={false}
        showLocationIndicator
        tileMapParams={tileMapParams}
        withObsTiles={tileMapParams !== null}
        zoomEnabled={false}
        zoomTapEnabled={false}
      />
      <Modal
        animationIn="fadeIn"
        animationOut="fadeOut"
        showModal={showMapModal}
        closeModal={( ) => setShowMapModal( false )}
        disableSwipeDirection
        style={DETAILS_MAP_MODAL_STYLE}
        modal={showModalMap}
      />
    </View>
  );
};

export default MapSection;
