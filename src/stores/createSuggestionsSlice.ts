import { FETCH_STATUS_ONLINE_ERROR } from "components/Suggestions/SuggestionsContainer.tsx";
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
  suggestionsError: null,
  suggestionsList: [],
  isLoading: true
};

interface SuggestionsSlice {
  commonAncestor: Object,
  offlineSuggestions: OfflineSuggestion[],
  onlineSuggestions: Array<Object>,
  resetSuggestionsSlice: ( ) => void
  setOfflineSuggestions: ( ) => void,
  setOnlineSuggestions: ( ) => void,
  setSuggestionsError: ( ) => void,
  suggestionsList: Array<Object>,
  suggestionsError: boolean,
  isLoading: boolean
}

const createSuggestionsSlice: StateCreator<SuggestionsSlice> = set => ( {
  ...DEFAULT_STATE,
  setOfflineSuggestions: offlineSuggestions => set( ( ) => ( { offlineSuggestions } ) ),
  setOnlineSuggestions: onlineSuggestions => set( ( ) => ( {
    // default to showing onlineSuggestions if they exist
    onlineSuggestions,
    offlineSuggestions: [],
    isLoading: false
  } ) ),
  setSuggestionsError: suggestionsError => set( ( ) => ( {
    suggestionsError,
    isLoading: suggestionsError !== FETCH_STATUS_ONLINE_ERROR
  } ) ),
  resetSuggestionsSlice: ( ) => set( { ...DEFAULT_STATE } ),
  setCommonAncestor: commonAncestor => set( ( ) => ( { commonAncestor } ) ),
  setSuggestionsList: suggestionsList => set( ( ) => ( { suggestionsList } ) ),
  setIsLoading: isLoading => set( ( ) => ( { isLoading } ) )
} );

export default createSuggestionsSlice;
