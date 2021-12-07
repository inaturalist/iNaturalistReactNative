// @flow

import React, { useState, useContext } from "react";
import { Text, FlatList, ActivityIndicator } from "react-native";
import type { Node } from "react";

import { textStyles } from "../../styles/explore/explore";
import InputField from "../SharedComponents/InputField";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import DropdownTaxaPicker from "./DropdownTaxaPicker";
import { fetchExploreObservations } from "./helpers/fetchExploreObservations";
// import useFetchPlaces from "./hooks/fetchPlaces";
import GridItem from "../Observations/GridItem";
import ObsCard from "../Observations/ObsCard";
import { useNavigation } from "@react-navigation/native";
import { ObservationContext } from "../../providers/contexts";


const Explore = ( ): Node => {
  const { exploreList, setExploreList } = useContext( ObservationContext );
  let view = "list";
  // const [view, setView] = useState( "list" );
  const [searchTerm, setSearchTerm] = useState( "" );
  const [taxaId, setTaxaId] = useState( null );
  const [location, setLocation] = useState( "" );
  const [loading, setLoading] = useState( false );
  const navigation = useNavigation( );

  // const places = useFetchPlaces( location );

  const updateLocation = input => setLocation( input );
  const showMap = async ( ) => {
    setLoading( true );
    if ( taxaId !== null ) {
      setExploreList( await fetchExploreObservations( taxaId ) );
    }
    setLoading( false );
  };

  const navToObsDetails = observation => navigation.navigate( "ObsDetails", { uuid: observation.uuid } );

  const renderItem = ( { item } ) => <ObsCard item={item} handlePress={navToObsDetails} />;
  const renderGridItem = ( { item } ) => <GridItem item={item} handlePress={navToObsDetails} />;
  const renderEmptyState = ( ) => null;

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
      {loading
        ? <ActivityIndicator />
        : (
          <FlatList
            data={exploreList}
            key={view === "grid" ? 1 : 0}
            renderItem={view === "grid" ? renderGridItem : renderItem}
            numColumns={view === "grid" ? 4 : 1}
            // testID="ObsList.myObservations"
            ListEmptyComponent={renderEmptyState}
          />
      )}
    </ViewWithFooter>
  );
};

export default Explore;
