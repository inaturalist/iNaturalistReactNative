// @flow

import DetailsMap from "components/SharedComponents/DetailsMap";
import type { Node } from "react";
import React, { useRef } from "react";

import TaxonDetailsTitle from "./TaxonDetailsTitle";

type Props = {
  taxon: Object,
  latitude: number,
  longitude: number,
  closeModal: Function,
  tileMapParams: ?Object,
  region: Object
}

const TaxonDetailsMapContainer = ( {
  taxon, region, latitude, longitude, closeModal, tileMapParams
}: Props ): Node => {
  const mapViewRef = useRef<any>( null );

  return (
    <DetailsMap
      region={region}
      showLocationIndicator={false}
      mapViewRef={mapViewRef}
      latitude={latitude}
      longitude={longitude}
      closeModal={closeModal}
      tileMapParams={tileMapParams}
      headerTitle={<TaxonDetailsTitle taxon={taxon} />}

    />
  );
};

export default TaxonDetailsMapContainer;
