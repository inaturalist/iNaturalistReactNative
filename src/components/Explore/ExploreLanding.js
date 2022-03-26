// @flow

import React, { useState, useContext } from "react";
import type { Node } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { textStyles, viewStyles } from "../../styles/explore/explore";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import DropdownPicker from "./DropdownPicker";
import { ExploreContext } from "../../providers/contexts";
import TranslatedText from "../SharedComponents/TranslatedText";
import FiltersIcon from "./FiltersIcon";

const Explore = ( ): Node => {
  const {
    setLoading,
    exploreFilters,
    setExploreFilters,
    taxon,
    setTaxon,
    location,
    setLocation
  } = useContext( ExploreContext );
  const navigation = useNavigation( );

  const navToExplore = ( ) => {
    setLoading( );
    navigation.navigate( "Explore" );
  };

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
      <TranslatedText text="Explore" />
      <TranslatedText style={textStyles.explanation} text="Visually-search-iNaturalist-data" />
      <FiltersIcon />
      <TranslatedText text="Taxon" />
      <DropdownPicker
        searchQuery={taxon}
        setSearchQuery={setTaxon}
        setValue={setTaxonId}
        sources="taxa"
        value={taxonId}
        placeholder="Search-for-a-taxon"
      />
      <TranslatedText text="Location" />
      <DropdownPicker
        searchQuery={location}
        setSearchQuery={setLocation}
        setValue={setPlaceId}
        sources="places"
        value={placeId}
        placeholder="Search-for-a-location"
      />
      <View style={viewStyles.positionBottom}>
        <RoundGreenButton
          buttonText="Explore"
          handlePress={navToExplore}
          testID="Explore.fetchObservations"
          disabled={!taxonId}
        />
      </View>
    </ViewWithFooter>
  );
};

export default Explore;
