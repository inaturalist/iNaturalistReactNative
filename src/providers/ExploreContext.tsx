import * as React from "react";

type Action = {type: 'SET_PHOTO_LICENSE', photoLicense: string}
type Dispatch = (action: Action) => void
type State = {
  exploreParams: {
    photoLicense: string
  }
}
type CountProviderProps = {children: React.ReactNode}

const ExploreContext = React.createContext<
  {state: State; dispatch: Dispatch} | undefined
>(undefined)

const ALL = "all";

const calculatedFilters = {
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
    case "SET_PHOTO_LICENSE":
      return {
        ...state,
        exploreParams: {
          ...state.exploreParams,
          photoLicense: action.photoLicense
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
