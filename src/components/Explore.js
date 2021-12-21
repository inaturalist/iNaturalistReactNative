// @flow

import React, { useState, useContext } from "react";
import { Text } from "react-native";
import type { Node } from "react";

import { textStyles } from "../../styles/explore/explore";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import DropdownTaxaPicker from "./DropdownTaxaPicker";
import DropdownPlacePicker from "./DropdownPlacePicker";
// import { fetchExploreObservations } from "./helpers/fetchExploreObservations";
import { ExploreContext } from "../../providers/contexts";
import ObservationViews from "../SharedComponents/ObservationViews/ObservationViews";

const Explore = ( ): Node => {
  const {
    exploreList,
    loadingExplore,
    setLoading,
    exploreFilters,
    setExploreFilters
  } = useContext( ExploreContext );
  const [searchTerm, setSearchTerm] = useState( "" );
  const [location, setLocation] = useState( "" );

  const showMap = ( ) => setLoading( );

  const setTaxonId = ( getValue ) => {
    setExploreFilters( {
      ...exploreFilters,
      taxon_id: getValue( )
    } );
  };

  const setPlaceId = ( getValue ) => {
    setExploreFilters( {
      ...exploreFilters,
      place_id: getValue( )
    } );
  };

  const taxonId = exploreFilters ? exploreFilters.taxon_id : null;
  const placeId = exploreFilters ? exploreFilters.place_id : null;

  return (
    <ViewWithFooter>
      <Text style={textStyles.explanation}>search for species and taxa seen anywhere in the world</Text>
      <Text style={textStyles.explanation}>try searching for insects near your location...</Text>
      <DropdownTaxaPicker
        searchTerm={searchTerm}
        search={setSearchTerm}
        setTaxonId={setTaxonId}
        taxonId={taxonId}
      />
      <DropdownPlacePicker
        location={location}
        search={setLocation}
        setPlaceId={setPlaceId}
        placeId={placeId}
      />
      <RoundGreenButton
        buttonText="EXPLORE ORGANISMS"
        handlePress={showMap}
        testID="Explore.fetchObservations"
      />
      {taxonId !== null && (
        <ObservationViews
          loading={loadingExplore}
          observationList={exploreList}
          taxonId={taxonId}
          testID="Explore.observations"
        />
      )}
    </ViewWithFooter>
  );
};

export default Explore;
