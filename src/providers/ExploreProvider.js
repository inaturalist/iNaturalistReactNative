// @flow
import React, { useState, useEffect } from "react";
import type { Node } from "react";
import inatjs from "inaturalistjs";

import { ExploreContext } from "./contexts";
import { FIELDS } from "./fields";
import Observation from "../models/Observation";

type Props = {
  children: any
}

const initialOptions = {
  order: "desc",
  order_by: "created_at",
  taxon_id: null,
  place_id: null
};

const initialFilters = {
  captive: false,
  hrank: [],
  introduced: false,
  lrank: [],
  months: [],
  native: false,
  photo_license: [],
  photos: true,
  project_id: null,
  // start by showing verifiable observations
  quality_grade: ["needs_id", "research"],
  sounds: false,
  threatened: false,
  user_id: null
};

const ExploreProvider = ( { children }: Props ): Node => {
  const [exploreList, setExploreList] = useState( [] );
  const [exploreFilters, setExploreFilters] = useState( {
    ...initialOptions,
    ...initialFilters
  } );
  const [unappliedFilters, setUnappliedFilters] = useState( {
    ...initialFilters
  } );
  const [loadingExplore, setLoadingExplore] = useState( false );
  const [taxon, setTaxon] = useState( "" );
  const [location, setLocation] = useState( "" );
  const [totalObservations, setTotalObservations] = useState( null );

  useEffect( ( ) => {
    let isCurrent = true;

    if ( !loadingExplore ) { return; }

    const fetchExplore = async ( ) => {
      // create filters object excluding keys with null values
      const filters = Object.fromEntries( Object.entries( exploreFilters ).filter( ( [_, v] ) => v != null ) );
      try {
        const params = {
          ...filters,
          fields: FIELDS
        };
        const response = await inatjs.observations.search( params );
        const totalResults = response.total_results;
        const { results } = await response;
        if ( !isCurrent ) { return; }
        setExploreList( results.map( obs => Observation.mimicRealmMappedPropertiesSchema( obs ) ) );
        setLoadingExplore( false );
        setTotalObservations( totalResults );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        setLoadingExplore( false );
        console.log( "Couldn't fetch explore observations:", e.message, );
      }
    };

    fetchExplore( );

    return ( ) => {
      isCurrent = false;
    };
  }, [exploreFilters, loadingExplore] );

  const setLoading = ( ) => setLoadingExplore( true );

  const resetFilters = ( ) => setExploreFilters( {
    ...exploreFilters,
    ...initialFilters
  } );

  const applyFilters = ( ) => {
    setLoadingExplore( true );
    const applied = Object.assign( exploreFilters, unappliedFilters );
    console.log( applied, "applied" );
    setExploreFilters( applied );
  };

  const resetUnappliedFilters = ( )  => setUnappliedFilters( {
    ...initialFilters
  } );

  const exploreValue = {
    exploreList,
    loadingExplore,
    setLoading,
    exploreFilters,
    setExploreFilters,
    resetFilters,
    taxon,
    setTaxon,
    location,
    setLocation,
    totalObservations,
    unappliedFilters,
    setUnappliedFilters,
    applyFilters,
    resetUnappliedFilters
  };

  return (
    <ExploreContext.Provider value={exploreValue}>
      {children}
    </ExploreContext.Provider>
  );
};

export default ExploreProvider;
