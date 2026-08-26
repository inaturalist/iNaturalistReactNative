import type { StateCreator } from "zustand";

export interface ExploreV2AdvancedSearchSlice {
  exploreV2AdvancedSearch: {
    advancedSearchMode: boolean;
    setAdvancedSearchMode: ( _advancedSearchMode: boolean ) => void;
  };
}

// advancedSearchMode has to be global state so it stays
// between different instances of the exloreV2 navigator
const createExploreV2AdvancedSearchSlice: StateCreator<ExploreV2AdvancedSearchSlice> = set => ( {
  exploreV2AdvancedSearch: {
    advancedSearchMode: false,
    setAdvancedSearchMode: advancedSearchMode => set( state => ( {
      exploreV2AdvancedSearch: {
        ...state.exploreV2AdvancedSearch,
        advancedSearchMode,
      },
    } ) ),
  },
} );

export default createExploreV2AdvancedSearchSlice;
