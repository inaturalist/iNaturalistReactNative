// @flow

import React, { useState } from "react";
import type { Node } from "react";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import useObservations from "./hooks/useObservations";
import GridView from "./GridView";
import DropdownPicker from "../Explore/DropdownPicker";

const Identify = ( ): Node => {
  const [location, setLocation] = useState( "" );
  const [placeId, setPlaceId] = useState( null );
  const [taxon, setTaxon] = useState( "" );
  const [taxonId, setTaxonId] = useState( null );
  const { observations, loading } = useObservations( placeId, taxonId );

  const updatePlaceId = ( getValue ) => setPlaceId( getValue( ) );
  const updateTaxonId = ( getValue ) => setTaxonId( getValue( ) );

  return (
    <ViewWithFooter>
      <DropdownPicker
        searchQuery={location}
        setSearchQuery={setLocation}
        setValue={updatePlaceId}
        sources="places"
        value={placeId}
      />
      <DropdownPicker
        searchQuery={taxon}
        setSearchQuery={setTaxon}
        setValue={updateTaxonId}
        sources="taxa"
        value={taxonId}
      />
      <GridView
        loading={loading}
        observationList={observations}
        testID="Identify.observationGrid"
      />
    </ViewWithFooter>
  );
};

export default Identify;
