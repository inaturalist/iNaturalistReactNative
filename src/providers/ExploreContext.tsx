import * as React from "react";

export enum EXPLORE_ACTION {
  SET_PHOTO_LICENSE = 'SET_PHOTO_LICENSE',
  SET_REVIEWED = 'SET_REVIEWED'
}

type Action = {type: EXPLORE_ACTION.SET_PHOTO_LICENSE, photoLicense: string} | {type: EXPLORE_ACTION.SET_REVIEWED, reviewedFilter: string}
type Dispatch = (action: Action) => void
type State = {
  exploreParams: {
    reviewedFilter: string,
    photoLicense: string
  }
}
type CountProviderProps = {children: React.ReactNode}

const ExploreContext = React.createContext<
  {state: State; dispatch: Dispatch} | undefined
>(undefined)

const ALL = "all";

const calculatedFilters = {
  reviewedFilter: ALL,
  photoLicense: ALL
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
