// @flow

import { Map } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  exploreParams: Object,
  region: Object,
  observations: Array<Object>
}

const ObservationsView = ( {
  exploreParams,
  region,
  observations
}: Props ): Node => {
  const tileMapParams = { };

  if ( exploreParams?.taxon_id ) {
    tileMapParams.taxon_id = exploreParams?.taxon_id;
  }
  if ( exploreParams?.place_id ) {
    tileMapParams.place_id = exploreParams?.place_id;
  }

  return (
    <Map
      currentLocationButtonClassName="left-5 bottom-20"
      mapViewClassName="-mt-3"
      observations={observations}
      region={region}
      showCurrentLocationButton
      showExplore
      showSwitchMapTypeButton
      showsCompass={false}
      switchMapTypeButtonClassName="left-20 bottom-20"
      tileMapParams={tileMapParams}
      withPressableObsTiles={tileMapParams !== null}
    />
  );
};

export default ObservationsView;
