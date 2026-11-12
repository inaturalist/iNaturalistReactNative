import type { StateCreator } from "zustand";

export interface ExploreAdvancedSearchSlice {
  exploreAdvancedSearch: {
    advancedSearchMode: boolean;
    setAdvancedSearchMode: ( _advancedSearchMode: boolean ) => void;
  };
}

// advancedSearchMode has to be global state so it stays
// between different instances of the exloreV2 navigator
const createExploreAdvancedSearchSlice: StateCreator<ExploreAdvancedSearchSlice> = set => ( {
  exploreAdvancedSearch: {
    advancedSearchMode: false,
    setAdvancedSearchMode: advancedSearchMode => set( state => ( {
      exploreAdvancedSearch: {
        ...state.exploreAdvancedSearch,
        advancedSearchMode,
      },
    } ) ),
  },
} );

export default createExploreAdvancedSearchSlice;
