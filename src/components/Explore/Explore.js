// @flow

import React, { useState, useContext } from "react";
import { Text } from "react-native";
import type { Node } from "react";

import { textStyles } from "../../styles/explore/explore";
import InputField from "../SharedComponents/InputField";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import DropdownTaxaPicker from "./DropdownTaxaPicker";
import { fetchExploreObservations } from "./helpers/fetchExploreObservations";
import { ObservationContext } from "../../providers/contexts";
import ObservationViews from "../SharedComponents/ObservationViews/ObservationViews";

const Explore = ( ): Node => {
  const { exploreList, setExploreList } = useContext( ObservationContext );
  const [searchTerm, setSearchTerm] = useState( "" );
  const [taxaId, setTaxaId] = useState( null );
  const [location, setLocation] = useState( "" );
  const [loading, setLoading] = useState( false );

  // const places = useFetchPlaces( location );

  const updateLocation = input => setLocation( input );
  const showMap = async ( ) => {
    setLoading( true );
    if ( taxaId !== null ) {
      setExploreList( await fetchExploreObservations( taxaId ) );
    }
    setLoading( false );
  };

  return (
    <ViewWithFooter>
      <Text style={textStyles.explanation}>search for species and taxa seen anywhere in the world</Text>
      <Text style={textStyles.explanation}>try searching for insects near your location...</Text>
      <DropdownTaxaPicker
        searchTerm={searchTerm}
        search={setSearchTerm}
        setTaxaId={setTaxaId}
        taxaId={taxaId}
      />
      <InputField
        handleTextChange={updateLocation}
        placeholder="location bar"
        text={location}
        type="none"
      />
      <RoundGreenButton
        buttonText="EXPLORE ORGANISMS"
        handlePress={showMap}
      />
      <ObservationViews
        loading={loading}
        observationList={exploreList}
        testID="Explore.observations"
      />
    </ViewWithFooter>
  );
};

export default Explore;
