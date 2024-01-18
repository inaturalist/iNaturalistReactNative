import * as React from "react";

export enum EXPLORE_ACTION {
  SET_PHOTO_LICENSE = "SET_PHOTO_LICENSE",
  SET_REVIEWED = "SET_REVIEWED",
  SET_WILD_STATUS = "SET_WILD_STATUS",
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
  TOGGLE_RESEARCH_GRADE = "TOGGLE_RESEARCH_GRADE"
}

const DEFAULT = "all";

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
type Action =
  {type: EXPLORE_ACTION.TOGGLE_RESEARCH_GRADE}
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
  | {type: EXPLORE_ACTION.SET_WILD_STATUS, wildStatus: WILD_STATUS}
  | {type: EXPLORE_ACTION.SET_REVIEWED, reviewedFilter: REVIEWED}
  | {type: EXPLORE_ACTION.SET_PHOTO_LICENSE, photoLicense: PHOTO_LICENSE | string}
type Dispatch = (action: Action) => void
type State = {
  exploreParams: {
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
    wildStatus: WILD_STATUS,
    reviewedFilter: REVIEWED,
    photoLicense: PHOTO_LICENSE | string
  }
}
type CountProviderProps = {children: React.ReactNode}

const ExploreContext = React.createContext<
  {state: State; dispatch: Dispatch} | undefined
>(undefined)

const calculatedFilters = {
  researchGrade: true,
  needsID: true,
  casual: false,
  hrank: undefined,
  lrank: undefined,
  dateObserved: DATE_OBSERVED.ALL,
  dateUploaded: DATE_UPLOADED.ALL,
  media: MEDIA.ALL,
  wildStatus: WILD_STATUS.ALL,
  reviewedFilter: REVIEWED.ALL,
  photoLicense: PHOTO_LICENSE.ALL
};

// Sort by: is NOT a filter criteria, but should return to default state when reset is pressed
const defaultFilters = {
  ...calculatedFilters,
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
  const value = { state, dispatch };
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
