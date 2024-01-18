import * as React from "react";

export enum EXPLORE_ACTION {
  SET_PHOTO_LICENSE = "SET_PHOTO_LICENSE",
  SET_REVIEWED = "SET_REVIEWED",
  SET_WILD_STATUS = "SET_WILD_STATUS",
  TOGGLE_INTRODUCED = "TOGGLE_INTRODUCED",
  TOGGLE_NATIVE = "TOGGLE_NATIVE",
  TOGGLE_ENDEMIC = "TOGGLE_ENDEMIC",
  TOGGLE_NO_STATUS = "TOGGLE_NO_STATUS",
  SET_MEDIA = "SET_MEDIA",
  SET_DATE_UPLOADED_ALL = "SET_DATE_UPLOADED_ALL",
  SET_DATE_UPLOADED_EXACT = "SET_DATE_UPLOADED_EXACT",
  SET_DATE_OBSERVED_ALL = "SET_DATE_OBSERVED_ALL",
  SET_DATE_OBSERVED_EXACT = "SET_DATE_OBSERVED_EXACT",
  SET_DATE_OBSERVED_MONTHS = "SET_DATE_OBSERVED_MONTHS",
  SET_LOWEST_TAXONOMIC_RANK = "SET_LOWEST_TAXONOMIC_RANK",
  SET_HIGHEST_TAXONOMIC_RANK = "SET_HIGHEST_TAXONOMIC_RANK",
  TOGGLE_CASUAL = "TOGGLE_CASUAL",
  TOGGLE_NEEDS_ID = "TOGGLE_NEEDS_ID",
  TOGGLE_RESEARCH_GRADE = "TOGGLE_RESEARCH_GRADE",
  CHANGE_SORT_BY = "CHANGE_SORT_BY",
  SET_PROJECT = "SET_PROJECT",
  SET_USER = "SET_USER",
  RESET = "RESET"
}

const DEFAULT = "all";

export enum SORT_BY {
  DATE_UPLOADED_NEWEST = "DATE_UPLOADED_NEWEST",
  DATE_UPLOADED_OLDEST = "DATE_UPLOADED_OLDEST",
  DATE_OBSERVED_NEWEST = "DATE_OBSERVED_NEWEST",
  DATE_OBSERVED_OLDEST = "DATE_OBSERVED_OLDEST",
  MOST_FAVED = "MOST_FAVED",
}

export enum DATE_OBSERVED {
  ALL = DEFAULT,
  EXACT_DATE = "exactDate",
  MONTHS = "months",
}

export enum DATE_UPLOADED {
  ALL = DEFAULT,
  EXACT_DATE = "exactDate",
}

export enum MEDIA {
  ALL = DEFAULT,
  PHOTOS = "photos",
  SOUNDS = "sounds",
  NONE = "noMedia"
}

export enum WILD_STATUS {
  ALL = DEFAULT,
  WILD = "wild",
  CAPTIVE = "captive"
}

export enum REVIEWED {
  ALL = DEFAULT,
  REVIEWED = "reviewed",
  UNREVIEWED = "unreviewed"
}

enum PHOTO_LICENSE {
  ALL = DEFAULT
}

// TODO: photoLicense should be only an enum
type Action = {type: EXPLORE_ACTION.RESET}
  | {type: EXPLORE_ACTION.SET_USER, user: Object, userId: number}
  | {type: EXPLORE_ACTION.SET_PROJECT, project: Object, projectId: number}
  | {type: EXPLORE_ACTION.CHANGE_SORT_BY, sortBy: SORT_BY}
  | {type: EXPLORE_ACTION.TOGGLE_RESEARCH_GRADE}
  | {type: EXPLORE_ACTION.TOGGLE_NEEDS_ID}
  | {type: EXPLORE_ACTION.TOGGLE_CASUAL}
  | {type: EXPLORE_ACTION.SET_HIGHEST_TAXONOMIC_RANK, hrank: string}
  | {type: EXPLORE_ACTION.SET_LOWEST_TAXONOMIC_RANK, lrank: string}
  | {type: EXPLORE_ACTION.SET_DATE_OBSERVED_ALL}
  | {type: EXPLORE_ACTION.SET_DATE_OBSERVED_EXACT, observed_on: string}
  | {type: EXPLORE_ACTION.SET_DATE_OBSERVED_MONTHS, months: number[]}
  | {type: EXPLORE_ACTION.SET_DATE_UPLOADED_ALL}
  | {type: EXPLORE_ACTION.SET_DATE_UPLOADED_EXACT, created_on: string}
  | {type: EXPLORE_ACTION.SET_MEDIA, media: MEDIA}
  | {type: EXPLORE_ACTION.TOGGLE_INTRODUCED}
  | {type: EXPLORE_ACTION.TOGGLE_NATIVE}
  | {type: EXPLORE_ACTION.TOGGLE_ENDEMIC}
  | {type: EXPLORE_ACTION.TOGGLE_NO_STATUS}
  | {type: EXPLORE_ACTION.SET_WILD_STATUS, wildStatus: WILD_STATUS}
  | {type: EXPLORE_ACTION.SET_REVIEWED, reviewedFilter: REVIEWED}
  | {type: EXPLORE_ACTION.SET_PHOTO_LICENSE, photoLicense: PHOTO_LICENSE | string}
type Dispatch = (action: Action) => void
type State = {
  exploreParams: {
    user_id: number | undefined,
    // TODO: not any Object but a "User" type (from server?)
    user: Object | undefined,
    project_id: number | undefined,
    // TODO: not any Object but a "Project" type (from server?)
    project: Object | undefined,
    sortBy: SORT_BY,
    researchGrade: boolean,
    needsID: boolean,
    casual: boolean,
    hrank: string | undefined,
    lrank: string | undefined,
    dateObserved: DATE_OBSERVED,
    // TODO: observed_on type should be more stringent than string it is what is expected by the API 
    observed_on: string | null | undefined,
    months: number[] | null | undefined,
    dateUploaded: DATE_UPLOADED,
    // TODO: created_on type should be more stringent than string it is what is expected by the API 
    created_on: string | null | undefined,
    media: MEDIA,
    // TODO: those values are not optional but idk how to set them
    introduced?: boolean,
    native?: boolean,
    endemic?: boolean,
    noStatus?: boolean
    wildStatus: WILD_STATUS,
    reviewedFilter: REVIEWED,
    photoLicense: PHOTO_LICENSE | string
  }
}
type CountProviderProps = {children: React.ReactNode}

const ExploreContext = React.createContext<
  {state: State; dispatch: Dispatch} | undefined
>(undefined)

// Every key in this object represents a numbered filter in the UI
const calculatedFilters = {
  user_id: undefined,
  project_id: undefined,
  researchGrade: true,
  needsID: true,
  casual: false,
  hrank: undefined,
  lrank: undefined,
  dateObserved: DATE_OBSERVED.ALL,
  dateUploaded: DATE_UPLOADED.ALL,
  media: MEDIA.ALL,
  // introduced: true
  // native: true,
  // endemic: true,
  // noStatus: true
  wildStatus: WILD_STATUS.ALL,
  // TODO: in the Figma designs this does not count towards the number of filters, error?
  reviewedFilter: REVIEWED.ALL,
  photoLicense: PHOTO_LICENSE.ALL
};

// Sort by: is NOT a filter criteria, but should return to default state when reset is pressed
const defaultFilters = {
  ...calculatedFilters,
  user: undefined,
  project: undefined,
  sortBy: SORT_BY.DATE_UPLOADED_NEWEST,
  observed_on: undefined,
  months: undefined,
  created_on: undefined,
};

const initialState = {
  exploreParams: {
    ...defaultFilters
  }
};

function exploreReducer( state: State, action: Action ) {
  switch ( action.type ) {
    case EXPLORE_ACTION.RESET:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          ...defaultFilters
        }
      };
    case EXPLORE_ACTION.SET_USER:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          user: action.user,
          user_id: action.userId
        }
      };
    case EXPLORE_ACTION.SET_PROJECT:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          project: action.project,
          project_id: action.projectId
        }
      };
    case EXPLORE_ACTION.CHANGE_SORT_BY:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          sortBy: action.sortBy
        }
      };
    case EXPLORE_ACTION.TOGGLE_RESEARCH_GRADE:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          researchGrade: !state.exploreParams.researchGrade
        }
      };
    case EXPLORE_ACTION.TOGGLE_NEEDS_ID:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          needsID: !state.exploreParams.needsID
        }
      };
    case EXPLORE_ACTION.TOGGLE_CASUAL:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          casual: !state.exploreParams.casual
        }
      };
    case EXPLORE_ACTION.SET_HIGHEST_TAXONOMIC_RANK:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          hrank: action.hrank
        }
      };
    case EXPLORE_ACTION.SET_LOWEST_TAXONOMIC_RANK:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          lrank: action.lrank
        }
      };
    case EXPLORE_ACTION.SET_DATE_OBSERVED_ALL:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          dateObserved: DATE_OBSERVED.ALL,
          observed_on: null,
          months: null
        }
      };
    case EXPLORE_ACTION.SET_DATE_OBSERVED_EXACT:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          dateObserved: DATE_OBSERVED.EXACT_DATE,
          observed_on: action.observed_on,
          months: null
        }
      };
    case EXPLORE_ACTION.SET_DATE_OBSERVED_MONTHS:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          dateObserved: DATE_OBSERVED.MONTHS,
          observed_on: null,
          months: action.months
        }
      };
    case EXPLORE_ACTION.SET_DATE_UPLOADED_ALL:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          dateUploaded: DATE_UPLOADED.ALL,
          created_on: null
        }
      };
    case EXPLORE_ACTION.SET_DATE_UPLOADED_EXACT:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          dateUploaded: DATE_UPLOADED.EXACT_DATE,
          created_on: action.created_on
        }
      };
    case EXPLORE_ACTION.SET_MEDIA:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          media: action.media
        }
      };
    case EXPLORE_ACTION.TOGGLE_INTRODUCED:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          introduced: !state.exploreParams.introduced
        }
      };
    case EXPLORE_ACTION.TOGGLE_NATIVE:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          native: !state.exploreParams.native
        }
      };
    case EXPLORE_ACTION.TOGGLE_ENDEMIC:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          endemic: !state.exploreParams.endemic
        }
      };
    case EXPLORE_ACTION.TOGGLE_NO_STATUS:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          noStatus: !state.exploreParams.noStatus
        }
      };
    case EXPLORE_ACTION.SET_WILD_STATUS:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          wildStatus: action.wildStatus
        }
      };
    case EXPLORE_ACTION.SET_PHOTO_LICENSE:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          photoLicense: action.photoLicense
        }
      };
    case EXPLORE_ACTION.SET_REVIEWED:
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          reviewedFilter: action.reviewedFilter
        }
      };
    default: {
      throw new Error( `Unhandled action type: ${(action as Action).type}` );
    }
  }
}

const ExploreProvider = ( { children }: CountProviderProps ) => {
  const [state, dispatch] = React.useReducer( exploreReducer, initialState );
  const { exploreParams } = state;

  // To store a snapshot of the state, e.g when the user opens the filters modal
  const [snapshot, setSnapshot] = React.useState<Object | undefined>( undefined );
  const makeSnapshot = () => setSnapshot( exploreParams );
  // Check if the current state is different from the snapshot
  const checkSnapshot = () => {
    if ( !snapshot ) {
      return false;
    }
    return Object.keys( snapshot ).some( key => snapshot[key] !== exploreParams[key] );
  }
  const differsFromSnapshot: boolean = checkSnapshot();

  const filtersNotDefault: boolean = Object.keys( defaultFilters ).some(
    key => defaultFilters[key] !== exploreParams[key]
  );

  let numberOfFilters: number = Object.keys( calculatedFilters ).reduce(
    ( count, key ) => {
      if ( exploreParams[key] !== calculatedFilters[key] ) {
        return count + 1;
      }
      return count;
    },
    0
  );
  if (state.exploreParams.lrank && state.exploreParams.hrank) {
    numberOfFilters -= 1;
  }

  const value = { state, dispatch, filtersNotDefault, numberOfFilters, makeSnapshot, differsFromSnapshot };
  return (
    <ExploreContext.Provider value={value}>{children}</ExploreContext.Provider>
  );
};

function useExplore() {
  const context = React.useContext( ExploreContext );
  if ( context === undefined ) {
    throw new Error( "useExplore must be used within a ExploreProvider" );
  }
  return context;
}

export { ExploreProvider, useExplore };
