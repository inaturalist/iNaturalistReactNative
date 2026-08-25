import { useCallback, useMemo } from "react";
import type { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import type { SPECIES_SORT } from "sharedHelpers/speciesSort";
import type {
  MyObservationsSlice,
  MyObservationsState,
  MyObservationsTaxon,
} from "stores/createMyObservationsSlice";
import { initialMyObservationsState } from "stores/createMyObservationsSlice";
import useStore from "stores/useStore";

// The state itself lives in createMyObservationsSlice; see the comment there
// for why it is in Zustand and not in a React context. This module keeps the
// reducer and the useMyObservations( ) hook so consumers keep the same
// { state, dispatch } shape they had when this was a context.
export type { MyObservationsState, MyObservationsTaxon };
export { initialMyObservationsState };

export enum MY_OBSERVATIONS_ACTION {
  SET_OBSERVATIONS_SORT = "SET_OBSERVATIONS_SORT",
  SET_SPECIES_SORT = "SET_SPECIES_SORT",
  SET_TAXON_SEARCH = "SET_TAXON_SEARCH",
  CLEAR_TAXON_SEARCH = "CLEAR_TAXON_SEARCH",
}

export type MyObservationsAction =
  | {
    type: MY_OBSERVATIONS_ACTION.SET_OBSERVATIONS_SORT;
    observationsSort: OBSERVATIONS_SORT;
  }
  | {
    type: MY_OBSERVATIONS_ACTION.SET_SPECIES_SORT;
    speciesSort: SPECIES_SORT;
  }
  | {
    type: MY_OBSERVATIONS_ACTION.SET_TAXON_SEARCH;
    searchTaxon: MyObservationsTaxon;
  }
  | { type: MY_OBSERVATIONS_ACTION.CLEAR_TAXON_SEARCH };

export function myObservationsReducer(
  state: MyObservationsState,
  action: MyObservationsAction,
): MyObservationsState {
  switch ( action.type ) {
    case MY_OBSERVATIONS_ACTION.SET_OBSERVATIONS_SORT:
      return { ...state, observationsSort: action.observationsSort };
    case MY_OBSERVATIONS_ACTION.SET_SPECIES_SORT:
      return { ...state, speciesSort: action.speciesSort };
    case MY_OBSERVATIONS_ACTION.SET_TAXON_SEARCH:
      return { ...state, searchedTaxon: action.searchTaxon };
    case MY_OBSERVATIONS_ACTION.CLEAR_TAXON_SEARCH:
      return { ...state, searchedTaxon: null };
    default: {
      // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

interface MyObservationsContextValue {
  state: MyObservationsState;
  dispatch: ( action: MyObservationsAction ) => void;
}

export function useMyObservations( ): MyObservationsContextValue {
  // Two separate selectors on purpose. A single selector returning
  // { state, dispatch } would allocate a new object on every store change
  // anywhere in the app, re-rendering all of My Observations during uploads
  // and syncs.
  const state: MyObservationsState = useStore(
    ( storeState: MyObservationsSlice ) => storeState.myObservations,
  );
  const updateMyObservations: MyObservationsSlice["updateMyObservations"] = useStore(
    ( storeState: MyObservationsSlice ) => storeState.updateMyObservations,
  );

  const dispatch = useCallback(
    ( action: MyObservationsAction ) => updateMyObservations(
      previous => myObservationsReducer( previous, action ),
    ),
    [updateMyObservations],
  );

  return useMemo( ( ) => ( { state, dispatch } ), [state, dispatch] );
}
