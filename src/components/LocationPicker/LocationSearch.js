// @flow

import {
  SearchBar
} from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import fetchCoordinates from "sharedHelpers/fetchCoordinates";

type Props = {
  region: Object,
  setRegion: Function,
  locationName: string
};

const LocationSearch = ( { region, setRegion, locationName }: Props ): Node => (
  <SearchBar
    handleTextChange={async locationText => {
      const newCoords = await fetchCoordinates( locationText );
      if ( !newCoords ) { return; }
      setRegion( {
        ...region,
        latitude: newCoords.latitude,
        longitude: newCoords.longitude
      } );
    }}
    value={locationName}
    testID="LocationPicker.locationSearch"
    containerClass="absolute top-[20px] right-[26px] left-[26px]"
  />
);

export default LocationSearch;
