// @flow

import React, { useContext } from "react";
import type { Node } from "react";

import DropdownPicker from "./DropdownPicker";
import { ExploreContext } from "../../providers/contexts";
import TranslatedText from "../SharedComponents/TranslatedText";

const TaxonLocationSearch = ( ): Node => {
  const {
    exploreFilters,
    setExploreFilters,
    taxon,
    setTaxon,
    location,
    setLocation
  } = useContext( ExploreContext );

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
    <>
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
    </>
  );
};

export default TaxonLocationSearch;
