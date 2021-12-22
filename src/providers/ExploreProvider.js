// @flow
import React, { useState, useEffect } from "react";
import type { Node } from "react";
import inatjs from "inaturalistjs";

import { ExploreContext } from "./contexts";
import { FIELDS, copyRealmSchema } from "./helpers";
import Observation from "../models/Observation";

type Props = {
  children: any
}

const initialFilters = {
  d1: null,
  d2: null,
  month: null,
  place_id: null,
  project_id: null,
  quality_grade: null,
  sort_by: "observed_on",
  taxon_id: null,
  user_id: null
};

const ExploreProvider = ( { children }: Props ): Node => {
  const [exploreList, setExploreList] = useState( [] );
  const [exploreFilters, setExploreFilters] = useState( initialFilters );
  const [loadingExplore, setLoadingExplore] = useState( false );

  useEffect( ( ) => {
    let isCurrent = true;

    if ( !loadingExplore ) { return; }

    const fetchExplore = async ( ) => {
      // create filters object excluding keys with null values
      const filters = Object.fromEntries( Object.entries( exploreFilters ).filter( ( [_, v] ) => v != null ) );
      try {
        const params = {
          // TODO: note that there's a bug with place_id in API v2, so this is not working
          // as of Dec 20, 2021 with a place selected
          ...filters,
          verifiable: true,
          photos: true,
          fields: FIELDS
        };
        const response = await inatjs.observations.search( params );
        const { results } = await response;
        if ( !isCurrent ) { return; }
        setExploreList( results.map( obs => Observation.copyRealmSchema( obs ) ) );
        setLoadingExplore( false );
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

  const clearFilters = ( ) => setExploreFilters( initialFilters );

  const exploreValue = {
    exploreList,
    loadingExplore,
    setLoading,
    exploreFilters,
    setExploreFilters,
    clearFilters
  };

  return (
    <ExploreContext.Provider value={exploreValue}>
      {children}
    </ExploreContext.Provider>
  );
};

export default ExploreProvider;
