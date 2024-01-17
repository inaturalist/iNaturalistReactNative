import * as React from "react";

export enum EXPLORE_ACTION {
  SET_PHOTO_LICENSE = "SET_PHOTO_LICENSE",
  SET_REVIEWED = "SET_REVIEWED",
  SET_WILD_STATUS = "SET_WILD_STATUS"
}

const DEFAULT = "all";

export enum WILD_STATUS {
  ALL = DEFAULT,
  WILD = "wild",
  CAPTIVE = "captive"
}

export enum REVIEWED_FILTER {
  ALL = DEFAULT,
  REVIEWED = "reviewed",
  UNREVIEWED = "unreviewed"
}

enum PHOTO_LICENSE {
  ALL = DEFAULT
}

// TODO: photoLicense should be only an enum
type Action = {type: EXPLORE_ACTION.SET_PHOTO_LICENSE, photoLicense: PHOTO_LICENSE | string} | {type: EXPLORE_ACTION.SET_REVIEWED, reviewedFilter: REVIEWED_FILTER} | {type: EXPLORE_ACTION.SET_WILD_STATUS, wildStatus: WILD_STATUS}
type Dispatch = (action: Action) => void
type State = {
  exploreParams: {
    wildStatus: WILD_STATUS,
    reviewedFilter: REVIEWED_FILTER,
    photoLicense: PHOTO_LICENSE | string
  }
}
type CountProviderProps = {children: React.ReactNode}

const ExploreContext = React.createContext<
  {state: State; dispatch: Dispatch} | undefined
>(undefined)

const calculatedFilters = {
  wildStatus: WILD_STATUS.ALL,
  reviewedFilter: REVIEWED_FILTER.ALL,
  photoLicense: PHOTO_LICENSE.ALL
};

// Sort by: is NOT a filter criteria, but should return to default state when reset is pressed
const defaultFilters = {
  ...calculatedFilters,
};

const initialState = {
  exploreParams: {
    ...defaultFilters
  }
};

function exploreReducer( state: State, action: Action ) {
  switch ( action.type ) {
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
