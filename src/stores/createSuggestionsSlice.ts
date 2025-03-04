import { StateCreator } from "zustand";

export const FETCH_STATUS_LOADING = "loading";
export const FETCH_STATUS_ONLINE_FETCHED = "online-fetched";
export const FETCH_STATUS_ONLINE_ERROR = "online-error";
export const FETCH_STATUS_FETCHING_OFFLINE = "fetching-offline";
export const FETCH_STATUS_OFFLINE_FETCHED = "offline-fetched";
export const FETCH_STATUS_OFFLINE_ERROR = "offline-error";
export const FETCH_STATUS_ONLINE_SKIPPED = "skipped";
export const FETCH_STATUS_ONLINE_TIMED_OUT = "online-timed-out";
export const FETCH_STATUS_ONLINE_DISCONNECTED = "online-disconnected";

// at the moment this is used for the Match screen but it's
// named suggestions so it can eventually work for both screens

interface OfflineSuggestion {
  combined_score: number;
  taxon: {
    id: number;
    name: string;
    rank_level: number;
    iconic_taxon_name: string | undefined;
  };
}

const DEFAULT_STATE = {
  commonAncestor: null,
  fetchStatus: null,
  offlineSuggestions: [],
  onlineSuggestions: [],
  suggestionsList: [],
  isLoading: true
};

interface SuggestionsSlice {
  commonAncestor: Object,
  fetchStatus: string | null,
  offlineSuggestions: OfflineSuggestion[],
  onlineSuggestions: Array<Object>,
  resetSuggestionsSlice: ( ) => void
  setOfflineSuggestions: ( ) => void,
  setOnlineSuggestions: ( ) => void,
  suggestionsList: Array<Object>,
  isLoading: boolean
}

const createSuggestionsSlice: StateCreator<SuggestionsSlice> = set => ( {
  ...DEFAULT_STATE,
  setOfflineSuggestions: ( offlineSuggestions, options ) => set( state => ( {
    ...state,
    offlineSuggestions,
    fetchStatus: options.fetchStatus || null,
    commonAncestor: options.commonAncestor || null
  } ) ),
  setOnlineSuggestions: ( onlineSuggestions, options ) => set( state => ( {
    ...state,
    onlineSuggestions,
    fetchStatus: options.fetchStatus || null,
    commonAncestor: options.commonAncestor || null
  } ) ),
  resetSuggestionsSlice: ( ) => set( { ...DEFAULT_STATE } ),
  setSuggestionsList: suggestionsList => set( state => ( {
    ...state,
    suggestionsList,
    isLoading: false
  } ) )
} );

export default createSuggestionsSlice;
