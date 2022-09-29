// @flow

import TranslatedText from "components/SharedComponents/TranslatedText";
import { ExploreContext } from "providers/contexts";
import type { Node } from "react";
import React, { useCallback, useContext, useState } from "react";

import DropdownPicker from "./DropdownPicker";

const TaxonLocationSearch = ( ): Node => {
  const {
    exploreFilters,
    setExploreFilters,
    taxon,
    setTaxon,
    location,
    setLocation
  } = useContext( ExploreContext );

  const [taxonOpen, setTaxonOpen] = useState( false );
  const [locationOpen, setLocationOpen] = useState( false );

  const onTaxonOpen = useCallback( ( ) => {
    setTaxonOpen( true );
    setLocationOpen( false );
  }, [] );

  const onLocationOpen = useCallback( ( ) => {
    setLocationOpen( true );
    setTaxonOpen( false );
  }, [] );

  const onClose = useCallback( ( ) => {
    setLocationOpen( false );
    setTaxonOpen( false );
  }, [] );

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
    <>
      <TranslatedText text="Taxon" />
      <DropdownPicker
        zIndex={3000}
        zIndexInverse={1000}
        searchQuery={taxon}
        setSearchQuery={setTaxon}
        setValue={setTaxonId}
        sources="taxa"
        value={taxonId}
        placeholder="Search-for-a-taxon"
        open={taxonOpen}
        onOpen={onTaxonOpen}
        onClose={onClose}
      />
      <TranslatedText text="Location" />
      <DropdownPicker
        zIndex={2000}
        zIndexInverse={2000}
        searchQuery={location}
        setSearchQuery={setLocation}
        setValue={setPlaceId}
        sources="places"
        value={placeId}
        placeholder="Search-for-a-location"
        open={locationOpen}
        onOpen={onLocationOpen}
        onClose={onClose}
      />
    </>
  );
};

export default TaxonLocationSearch;
