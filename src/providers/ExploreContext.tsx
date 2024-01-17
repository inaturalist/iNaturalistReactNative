import * as React from "react";

type Action = {type: 'setup1'} | {type: 'setup2'}
type Dispatch = (action: Action) => void
type State = {}
type CountProviderProps = {children: React.ReactNode}

const ExploreContext = React.createContext<
  {state: State; dispatch: Dispatch} | undefined
>(undefined)

function exploreReducer( state: State, action: Action ) {
  switch ( action.type ) {
    case "setup1": {
      return { ...state };
    }
    case "setup2": {
      return { };
    }
    default: {
      throw new Error( `Unhandled action type: ${(action as Action).type}` );
    }
  }
}

const ExploreProvider = ( { children }: CountProviderProps ) => {
  const initialState = { };
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
