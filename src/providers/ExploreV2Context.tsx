import * as React from "react";

import fetchCoarseUserLocation from "../sharedHelpers/fetchCoarseUserLocation";

export enum EXPLORE_V2_ACTION {
  SET_SUBJECT = "SET_SUBJECT",
  CLEAR_SUBJECT = "CLEAR_SUBJECT",
  SET_LOCATION_NEARBY = "SET_LOCATION_NEARBY",
  SET_LOCATION_WORLDWIDE = "SET_LOCATION_WORLDWIDE",
  SET_LOCATION_PLACE = "SET_LOCATION_PLACE",
  SET_SORT = "SET_SORT",
  SET_FILTERS = "SET_FILTERS",
  RESET = "RESET"
}

export enum EXPLORE_V2_PLACE_MODE {
  NEARBY = "NEARBY",
  WORLDWIDE = "WORLDWIDE",
  PLACE = "PLACE"
}

// more options to be potentially added in MOB-1333
export enum EXPLORE_V2_SORT {
  DATE_UPLOADED_NEWEST = "DATE_UPLOADED_NEWEST",
  DATE_UPLOADED_OLDEST = "DATE_UPLOADED_OLDEST",
  DATE_OBSERVED_NEWEST = "DATE_OBSERVED_NEWEST",
  DATE_OBSERVED_OLDEST = "DATE_OBSERVED_OLDEST",
  MOST_FAVED = "MOST_FAVED"
}

interface Place {
  id: number;
  display_name?: string;
}

interface Taxon {
  id: number;
  name: string;
}

interface User {
  id: number;
  login: string;
}

interface Project {
  id: number;
  title: string;
}

export type ExploreV2Subject =
  | { type: "taxon"; taxon: Taxon }
  | { type: "user"; user: User }
  | { type: "project"; project: Project };

// To be added to in MOB-1346
export interface ExploreV2Filters {
  [key: string]: unknown;
}

export interface ExploreV2State {
  subject: ExploreV2Subject | null;
  placeMode: EXPLORE_V2_PLACE_MODE;
  lat?: number;
  lng?: number;
  radius?: number;
  place: Place | null;
  sortBy: EXPLORE_V2_SORT;
  filters: ExploreV2Filters;
}

export type ExploreV2Action =
  | { type: EXPLORE_V2_ACTION.SET_SUBJECT; subject: ExploreV2Subject }
  | { type: EXPLORE_V2_ACTION.CLEAR_SUBJECT }
  | {
    type: EXPLORE_V2_ACTION.SET_LOCATION_NEARBY;
    lat: number;
    lng: number;
    radius: number;
  }
  | { type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE }
  | {
    type: EXPLORE_V2_ACTION.SET_LOCATION_PLACE;
    place: Place;
  }
  | { type: EXPLORE_V2_ACTION.SET_SORT; sortBy: EXPLORE_V2_SORT }
  | { type: EXPLORE_V2_ACTION.SET_FILTERS; filters: ExploreV2Filters }
  | { type: EXPLORE_V2_ACTION.RESET };

export const initialExploreV2State: ExploreV2State = {
  subject: null,
  placeMode: EXPLORE_V2_PLACE_MODE.NEARBY,
  lat: undefined,
  lng: undefined,
  radius: undefined,
  place: null,
  sortBy: EXPLORE_V2_SORT.DATE_UPLOADED_NEWEST,
  filters: {},
};

export function exploreV2Reducer(
  state: ExploreV2State,
  action: ExploreV2Action,
): ExploreV2State {
  switch ( action.type ) {
    case EXPLORE_V2_ACTION.SET_SUBJECT:
      return { ...state, subject: action.subject };
    case EXPLORE_V2_ACTION.CLEAR_SUBJECT:
      return { ...state, subject: null };
    case EXPLORE_V2_ACTION.SET_LOCATION_NEARBY:
      return {
        ...state,
        placeMode: EXPLORE_V2_PLACE_MODE.NEARBY,
        lat: action.lat,
        lng: action.lng,
        radius: action.radius,
        place: null,
      };
    case EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE:
      return {
        ...state,
        placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE,
        lat: undefined,
        lng: undefined,
        radius: undefined,
        place: null,
      };
    case EXPLORE_V2_ACTION.SET_LOCATION_PLACE:
      return {
        ...state,
        placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
        lat: undefined,
        lng: undefined,
        radius: undefined,
        place: action.place,
      };
    case EXPLORE_V2_ACTION.SET_SORT:
      return { ...state, sortBy: action.sortBy };
    case EXPLORE_V2_ACTION.SET_FILTERS:
      return { ...state, filters: action.filters };
    case EXPLORE_V2_ACTION.RESET:
      return initialExploreV2State;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

export type DefaultExploreV2Location =
  | { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE }
  | {
    placeMode: EXPLORE_V2_PLACE_MODE.NEARBY;
    lat: number;
    lng: number;
    radius: number;
  };

export async function defaultExploreV2Location( ): Promise<DefaultExploreV2Location> {
  const location = await fetchCoarseUserLocation( );
  if ( !location || !location.latitude ) {
    return { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE };
  }
  return {
    placeMode: EXPLORE_V2_PLACE_MODE.NEARBY,
    lat: location.latitude,
    lng: location.longitude,
    radius: 1,
  };
}

interface ExploreV2ContextValue {
  state: ExploreV2State;
  dispatch: ( action: ExploreV2Action ) => void;
}

const ExploreV2Context = React.createContext<ExploreV2ContextValue | undefined>(
  undefined,
);

interface ExploreV2ProviderProps {
  children: React.ReactNode;
}

export const ExploreV2Provider = ( { children }: ExploreV2ProviderProps ) => {
  const [state, dispatch] = React.useReducer( exploreV2Reducer, initialExploreV2State );

  const value = React.useMemo(
    () => ( { state, dispatch } ),
    [state],
  );

  return (
    <ExploreV2Context.Provider value={value}>
      {children}
    </ExploreV2Context.Provider>
  );
};

export function useExploreV2( ): ExploreV2ContextValue {
  const context = React.useContext( ExploreV2Context );
  // Pattern from https://kentcdodds.com/blog/how-to-use-react-context-effectively
  if ( context === undefined ) {
    throw new Error( "useExploreV2 must be used within an ExploreV2Provider" );
  }
  return context;
}
