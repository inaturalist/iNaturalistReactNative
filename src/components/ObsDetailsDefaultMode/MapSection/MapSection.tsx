import DetailsMapHeader from "components/ObsDetailsSharedComponents/DetailsTab/DetailsMapHeader";
import {
  DetailsMap,
  Map,
  Modal,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React, { useCallback, useMemo, useState } from "react";
import type { Geoprivacy } from "realmModels/geoprivacy";
import { useCurrentUser } from "sharedHooks";

interface Props {
  observation: {
    geoprivacy?: Geoprivacy;
    latitude?: number | null;
    longitude?: number | null;
    obscured?: boolean | null;
    place_guess?: string | null;
    placeGuess?: string | null;
    positional_accuracy?: number | null;
    private_place_guess?: string | null;
    privateLatitude?: number | null;
    privateLongitude?: number | null;
    privatePlaceGuess?: string | null;
    taxon?: { id: number };
    taxon_geoprivacy?: Geoprivacy;
    user: { id: number };
  };
  taxon?: { id?: number };
}

const DETAILS_MAP_MODAL_STYLE = { margin: 0 };

const MapSection = ( { observation, taxon }: Props ) => {
  const currentUser = useCurrentUser( );
  const [showMapModal, setShowMapModal] = useState( false );
  const latitude = observation.privateLatitude || observation.latitude;
  const longitude = observation.privateLongitude || observation.longitude;
  const coordinateString = t( "Lat-Lon", {
    latitude,
    longitude,
  } );

  const openMapScreen = useCallback( ( ) => setShowMapModal( true ), [] );

  const taxonId = taxon?.id || observation?.taxon?.id;

  const tileMapParams = useMemo( ( ) => ( taxonId
    ? {
      taxon_id: taxonId,
      verifiable: true,
    }
    : null ), [taxonId] );

  const showModalMap = useMemo( ( ) => (
    <DetailsMap
      coordinateString={coordinateString}
      closeModal={( ) => setShowMapModal( false )}
      observation={observation}
      // TS error: DetailsMap types tileMapParams as strings only, but Map accepts any object.
      // Fix when next touching DetailsMap; ObsDetails' LocationSection has the same error.
      tileMapParams={tileMapParams}
      withObsTiles={tileMapParams !== null}
      headerTitle={(
        <DetailsMapHeader currentUser={currentUser} observation={observation} />
      )}
    />
  ), [
    coordinateString,
    currentUser,
    observation,
    tileMapParams,
  ] );

  if ( !latitude ) {
    return null;
  }

  return (
    <View testID="MapSection" className="h-[200px]">
      <Map
        mapHeight={200}
        observation={observation}
        openMapScreen={openMapScreen}
        scrollEnabled={false}
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
