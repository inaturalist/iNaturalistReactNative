import { StateCreator } from "zustand";

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
  isLoading: true,
  timedOut: false
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
  isLoading: boolean,
  timedOut: boolean
}

const createSuggestionsSlice: StateCreator<SuggestionsSlice> = set => ( {
  ...DEFAULT_STATE,
  setOfflineSuggestions: ( offlineSuggestions, fetchStatus = null ) => set( ( ) => ( {
    offlineSuggestions,
    fetchStatus
  } ) ),
  setOnlineSuggestions: ( onlineSuggestions, fetchStatus = null ) => set( ( ) => ( {
    onlineSuggestions,
    fetchStatus
  } ) ),
  resetSuggestionsSlice: ( ) => set( { ...DEFAULT_STATE } ),
  setCommonAncestor: commonAncestor => set( ( ) => ( { commonAncestor } ) ),
  setSuggestionsList: suggestionsList => set( ( ) => ( {
    suggestionsList,
    isLoading: false
  } ) ),
  setIsLoading: isLoading => set( ( ) => ( { isLoading } ) ),
  setTimedOut: timedOut => set( ( ) => ( { timedOut } ) )
} );

export default createSuggestionsSlice;
