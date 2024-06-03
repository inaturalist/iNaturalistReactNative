// @flow

import { searchObservations } from "api/observations";
import {
  DetailsMap,
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

import TaxonDetailsTitle from "./TaxonDetailsTitle";

type Props = {
  taxon: Object
}

function getMapRegion( bounds: { nelat: number, nelng: number, swlat: number, swlng: number } ) {
  const {
    nelat, nelng, swlat, swlng
  } = bounds;
  // Deltas shouldn't be negative
  const latDelta = Math.abs( Number( nelat ) - Number( swlat ) );
  const lngDelta = Math.abs( Number( nelng ) - Number( swlng ) );
  const lat = nelat - ( latDelta / 2 );
  const lng = nelng - ( lngDelta / 2 );

  return {
    latitude: lat,
    longitude: lng,
    // Pad the detlas so the user sees the full range, make sure we don't
    // specify impossible deltas like 190 degrees of latitude
    latitudeDelta: Math.min( latDelta + 5, 175 ),
    longitudeDelta: Math.min( lngDelta + 5, 355 )
  };
}

const TaxonMapPreview = ( {
  taxon
}: Props ): Node => {
  const { t } = useTranslation( );
  const [showMapModal, setShowMapModal] = useState( false );
  const obsParams = {
    taxon_id: taxon.id,
    verifiable: true
  };

  // TODO: add a loading indicator for map preview
  const {
    data: obsSearchResponse
  } = useAuthenticatedQuery(
    ["fetchTaxonBoundingBox"],
    optsWithAuth => searchObservations( {
      ...obsParams,
      return_bounds: true,
      per_page: 0,
      ttl: -1
    }, optsWithAuth )
  );

  if ( obsSearchResponse?.total_bounds ) {
    const region = getMapRegion( obsSearchResponse?.total_bounds );

    return (
      <View className="relative h-[390px]">
        <Heading4 className="mb-3">{t( "MAP" )}</Heading4>
        <Map
          // Disable interaction
          mapHeight={230}
          mapViewClassName="-mx-3"
          openMapScreen={() => setShowMapModal( true )}
          permissionRequested={false}
          region={region}
          scrollEnabled={false}
          tileMapParams={obsParams}
          withObsTiles
          zoomEnabled={false}
          zoomTapEnabled={false}
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
            <DetailsMap
              region={region}
              latitude={region.latitude}
              longitude={region.longitude}
              closeModal={( ) => setShowMapModal( false )}
              tileMapParams={obsParams}
              showLocationIndicator={false}
              headerTitle={<TaxonDetailsTitle taxon={taxon} />}
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
