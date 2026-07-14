import type { Place } from "providers/ExploreV2Context";
import type { StateCreator } from "zustand";

export const MAX_RECENT_LOCATION_SEARCHES = 5;

const DEFAULT_STATE = {
  recentLocationSearches: [] as Place[],
};

export interface RecentLocationSearchesSlice {
  recentLocationSearches: Place[];
  addRecentLocationSearch: ( place: Place ) => void;
}

const createRecentLocationSearchesSlice: StateCreator<RecentLocationSearchesSlice> = set => ( {
  ...DEFAULT_STATE,
  addRecentLocationSearch: place => set( state => ( {
    recentLocationSearches: [
      place,
      ...state.recentLocationSearches.filter( existing => existing.id !== place.id ),
    ].slice( 0, MAX_RECENT_LOCATION_SEARCHES ),
  } ) ),
} );

export default createRecentLocationSearchesSlice;
