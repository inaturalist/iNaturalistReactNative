import * as React from "react";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { SPECIES_SORT } from "sharedHelpers/speciesSort";

export enum MY_OBSERVATIONS_ACTION {
  SET_OBSERVATIONS_SORT = "SET_OBSERVATIONS_SORT",
  SET_SPECIES_SORT = "SET_SPECIES_SORT",
  SET_TAXON_SEARCH = "SET_TAXON_SEARCH",
  CLEAR_TAXON_SEARCH = "CLEAR_TAXON_SEARCH",
}

export interface MyObservationsTaxon {
  id: number;
  name: string;
  preferred_common_name?: string;
  iconUri?: string;
}

export interface MyObservationsState {
  observationsSort: OBSERVATIONS_SORT;
  speciesSort: SPECIES_SORT;
  searchedTaxon: MyObservationsTaxon | null;
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

export const initialMyObservationsState: MyObservationsState = {
  observationsSort: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
  speciesSort: SPECIES_SORT.COUNT_DESC,
  searchedTaxon: null,
};

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

const MyObservationsContext = React.createContext<
  MyObservationsContextValue | undefined
>( undefined );

export const MyObservationsProvider = ( {
  children,
}: React.PropsWithChildren ) => {
  const [state, dispatch] = React.useReducer(
    myObservationsReducer,
    initialMyObservationsState,
  );

  const value = React.useMemo(
    () => ( { state, dispatch } ),
    [state],
  );

  return (
    <MyObservationsContext value={value}>
      {children}
    </MyObservationsContext>
  );
};

export function useMyObservations( ): MyObservationsContextValue {
  const context = React.useContext( MyObservationsContext );
  // Pattern from https://kentcdodds.com/blog/how-to-use-react-context-effectively
  if ( context === undefined ) {
    throw new Error( "useMyObservations must be used within a MyObservationsProvider" );
  }
  return context;
}
