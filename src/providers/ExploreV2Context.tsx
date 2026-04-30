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

// Sort options. The full Observations sort enum (Taxonomy, Alphabetical, etc.)
// is owned by MOB-1333; for now we cover the four date-sort cases plus most-faved
// which is what searchObservations supports today.
export enum EXPLORE_V2_SORT {
  DATE_UPLOADED_NEWEST = "DATE_UPLOADED_NEWEST",
  DATE_UPLOADED_OLDEST = "DATE_UPLOADED_OLDEST",
  DATE_OBSERVED_NEWEST = "DATE_OBSERVED_NEWEST",
  DATE_OBSERVED_OLDEST = "DATE_OBSERVED_OLDEST",
  MOST_FAVED = "MOST_FAVED"
}

export type ExploreV2SubjectType = "taxon" | "user" | "project";

interface Place {
  id: number;
  display_name?: string;
}

interface Taxon {
  id: number;
  name?: string;
}

interface User {
  id: number;
  login?: string;
}

interface Project {
  id: number;
  title?: string;
}

// Filter scaffold. MOB-1346 (Advanced Search) populates this. Kept open-ended
// so sibling tickets can extend without a context migration.
export interface ExploreV2Filters {
  [key: string]: unknown;
}

export interface ExploreV2State {
  subjectType: ExploreV2SubjectType | null;
  taxon: Taxon | null;
  user: User | null;
  project: Project | null;
  placeMode: EXPLORE_V2_PLACE_MODE;
  lat?: number;
  lng?: number;
  radius?: number;
  place: Place | null;
  placeId: number | null;
  placeGuess: string;
  sortBy: EXPLORE_V2_SORT;
  filters: ExploreV2Filters;
}

export type ExploreV2Action =
  | {
    type: EXPLORE_V2_ACTION.SET_SUBJECT;
    subjectType: "taxon";
    taxon: Taxon;
  }
  | {
    type: EXPLORE_V2_ACTION.SET_SUBJECT;
    subjectType: "user";
    user: User;
  }
  | {
    type: EXPLORE_V2_ACTION.SET_SUBJECT;
    subjectType: "project";
    project: Project;
  }
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
    placeGuess?: string;
  }
  | { type: EXPLORE_V2_ACTION.SET_SORT; sortBy: EXPLORE_V2_SORT }
  | { type: EXPLORE_V2_ACTION.SET_FILTERS; filters: ExploreV2Filters }
  | { type: EXPLORE_V2_ACTION.RESET };

type Dispatch = ( action: ExploreV2Action ) => void;

export const initialExploreV2State: ExploreV2State = {
  subjectType: null,
  taxon: null,
  user: null,
  project: null,
  // Initial placeMode is NEARBY; the container resolves to coords (granted) or
  // WORLDWIDE (denied/blocked) once permission state is known.
  placeMode: EXPLORE_V2_PLACE_MODE.NEARBY,
  lat: undefined,
  lng: undefined,
  radius: undefined,
  place: null,
  placeId: null,
  placeGuess: "",
  sortBy: EXPLORE_V2_SORT.DATE_UPLOADED_NEWEST,
  filters: {},
};

export function exploreV2Reducer(
  state: ExploreV2State,
  action: ExploreV2Action,
): ExploreV2State {
  switch ( action.type ) {
    case EXPLORE_V2_ACTION.SET_SUBJECT: {
      // Universal search: only one subject type is active at a time.
      const cleared = {
        ...state,
        subjectType: action.subjectType,
        taxon: null,
        user: null,
        project: null,
      };
      if ( action.subjectType === "taxon" ) {
        return { ...cleared, taxon: action.taxon };
      }
      if ( action.subjectType === "user" ) {
        return { ...cleared, user: action.user };
      }
      return { ...cleared, project: action.project };
    }
    case EXPLORE_V2_ACTION.CLEAR_SUBJECT:
      return {
        ...state,
        subjectType: null,
        taxon: null,
        user: null,
        project: null,
      };
    case EXPLORE_V2_ACTION.SET_LOCATION_NEARBY:
      return {
        ...state,
        placeMode: EXPLORE_V2_PLACE_MODE.NEARBY,
        lat: action.lat,
        lng: action.lng,
        radius: action.radius,
        place: null,
        placeId: null,
        placeGuess: "",
      };
    case EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE:
      return {
        ...state,
        placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE,
        lat: undefined,
        lng: undefined,
        radius: undefined,
        place: null,
        placeId: null,
        placeGuess: "",
      };
    case EXPLORE_V2_ACTION.SET_LOCATION_PLACE:
      return {
        ...state,
        placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
        lat: undefined,
        lng: undefined,
        radius: undefined,
        place: action.place,
        placeId: action.place.id,
        placeGuess: action.placeGuess ?? action.place.display_name ?? "",
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
  dispatch: Dispatch;
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
  if ( context === undefined ) {
    throw new Error( "useExploreV2 must be used within an ExploreV2Provider" );
  }
  return context;
}
