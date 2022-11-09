// @flow

import TranslatedText from "components/SharedComponents/TranslatedText";
import { ExploreContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { View } from "react-native";
import { viewStyles } from "styles/explore/explore";

import DropdownPicker from "./DropdownPicker";
import FiltersIcon from "./FiltersIcon";

const Explore = ( ): Node => {
  const {
    exploreFilters,
    setExploreFilters,
    taxon,
    setTaxon,
    location,
    setLocation
  } = useContext( ExploreContext );
  const setTaxonId = getValue => {
    setExploreFilters( {
      ...exploreFilters,
      taxon_id: getValue( )
    } );
  };

  const setPlaceId = getValue => {
    setExploreFilters( {
      ...exploreFilters,
      place_id: getValue( )
    } );
  };

  const taxonId = exploreFilters ? exploreFilters.taxon_id : null;
  const placeId = exploreFilters ? exploreFilters.place_id : null;

  return (
    <View style={viewStyles.bottomCard}>
      <TranslatedText text="Explore" />
      <FiltersIcon />
      <DropdownPicker
        searchQuery={taxon}
        setSearchQuery={setTaxon}
        setValue={setTaxonId}
        sources="taxa"
        value={taxonId}
        placeholder="Search-for-a-taxon"
      />
      <DropdownPicker
        searchQuery={location}
        setSearchQuery={setLocation}
        setValue={setPlaceId}
        sources="places"
        value={placeId}
        placeholder="Search-for-a-location"
      />
    </View>
  );
};

export default Explore;
