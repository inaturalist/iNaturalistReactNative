// @flow
import { searchObservations } from "api/observations";
import type { Node } from "react";
import React, { useMemo, useState } from "react";
import Observation from "realmModels/Observation";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

import { ExploreContext } from "./contexts";

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
  const [exploreFilters, setExploreFilters] = useState( {
    ...initialOptions,
    ...initialFilters
  } );
  const [unappliedFilters, setUnappliedFilters] = useState( {
    ...initialFilters
  } );
  const [taxon, setTaxon] = useState( "" );
  const [location, setLocation] = useState( "" );

  // create filters object excluding keys with null values
  const filters = Object.fromEntries(
    Object.entries( exploreFilters ).filter( ( [_, v] ) => v != null )
  );

  const searchParams = {
    ...filters,
    fields: Observation.FIELDS
  };

  const {
    data: exploreList,
    isLoading: loadingExplore
  } = useAuthenticatedQuery(
    ["searchObservations"],
    optsWithAuth => searchObservations( searchParams, optsWithAuth )
  );

  const resetUnappliedFilters = ( ) => setUnappliedFilters( {
    ...initialFilters
  } );

  const exploreValue = useMemo( ( ) => {
    const resetFilters = ( ) => setExploreFilters( {
      ...exploreFilters,
      ...initialFilters
    } );

    const applyFilters = ( ) => {
      const applied = Object.assign( exploreFilters, unappliedFilters );
      setExploreFilters( applied );
    };
    return {
      applyFilters,
      exploreFilters,
      exploreList,
      loadingExplore,
      location,
      resetFilters,
      resetUnappliedFilters,
      setExploreFilters,
      setLocation,
      setTaxon,
      setUnappliedFilters,
      taxon,
      unappliedFilters
    };
  }, [
    exploreFilters,
    exploreList,
    loadingExplore,
    location,
    taxon,
    unappliedFilters
  ] );

  return (
    <ExploreContext.Provider value={exploreValue}>
      {children}
    </ExploreContext.Provider>
  );
};

export default ExploreProvider;
