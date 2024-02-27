// @flow

import { searchObservations } from "api/observations";
import {
  Heading4,
  Map,
  Modal
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { useTranslation } from "sharedHooks";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

import TaxonDetailsMapContainer from "./TaxonDetailsMapContainer";

  type Props = {
    taxon: Object
  }

const TaxonMapPreview = ( {
  taxon
}: Props ): Node => {
  const { t } = useTranslation( );
  const [showMapModal, setShowMapModal] = useState( false );
  const {
    data: taxonList
  } = useAuthenticatedQuery(
    ["fetchTaxonBoundingBox"],
    optsWithAuth => searchObservations( {
      taxon_id: taxon.id,
      return_bounds: true,
      verifiable: true,
      ttl: -1
    }, optsWithAuth )
  );

  const tileMapParams = {
    taxon: taxon.id
  };

  const getMapRegion = bounds => {
    const {
      nelat, nelng, swlat, swlng
    } = bounds;
    const lat = ( Number( nelat ) + Number( swlat ) ) / 2;
    const lng = ( Number( nelng ) + Number( swlng ) ) / 2;
    const latDelta = Number( nelat ) - lat;
    const lngDelta = Number( nelat ) - lng;

    return {
      latitude: lat,
      longitude: lng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta
    };
  };

  if ( taxonList?.total_bounds ) {
    const region = getMapRegion( taxonList?.total_bounds );

    return (
      <View className="relative h-[390px]">
        <Heading4 className="mb-3">{t( "MAP" )}</Heading4>
        <Map
          region={region}
          mapHeight={230}
          openMapScreen={() => setShowMapModal( true )}
          tileMapParams={tileMapParams}
          withObsTiles={tileMapParams !== null}
        />
        <Modal
          animationIn="fadeIn"
          animationOut="fadeOut"
          showModal={showMapModal}
          closeModal={( ) => setShowMapModal( false )}
          disableSwipeDirection
          // eslint-disable-next-line react-native/no-inline-styles
          style={{ margin: 0 }}
          modal={(
            <TaxonDetailsMapContainer
              region={region}
              taxon={taxon}
              latitude={region.latitude}
              longitude={region.longitude}
              closeModal={( ) => setShowMapModal( false )}
              tileMapParams={tileMapParams}
            />
          )}
        />
      </View>

    );
  }

  return (
    <View className="relative h-[390px]" />

  );
};

export default TaxonMapPreview;
