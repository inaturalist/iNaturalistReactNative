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
  offlineSuggestions: [],
  onlineSuggestions: [],
  suggestionsError: null,
  topSuggestion: null,
  otherSuggestions: [],
  shouldUseLocation: false
};

interface SuggestionsSlice {
  offlineSuggestions: OfflineSuggestion[],
  onlineSuggestions: Array<Object>,
  setOfflineSuggestions: ( ) => void,
  setOnlineSuggestions: ( ) => void,
  suggestionsError: boolean,
  setSuggestionsError: ( ) => void,
  topSuggestion: Object,
  otherSuggestions: Array<Object>,
  shouldUseLocation: boolean
}

const createSuggestionsSlice: StateCreator<SuggestionsSlice> = set => ( {
  ...DEFAULT_STATE,
  setOfflineSuggestions: offlineSuggestions => set( ( ) => ( { offlineSuggestions } ) ),
  setOnlineSuggestions: onlineSuggestions => set( ( ) => ( { onlineSuggestions } ) ),
  setSuggestionsError: suggestionsError => set( ( ) => ( { suggestionsError } ) ),
  resetSuggestionsSlice: ( ) => set( { ...DEFAULT_STATE } ),
  setTopAndOtherSuggestions: ( newTopSuggestion, newOtherSuggestions ) => set( ( ) => ( {
    topSuggestion: newTopSuggestion,
    otherSuggestions: newOtherSuggestions
  } ) ),
  setShouldUseLocation: shouldUseLocation => set( ( ) => ( { shouldUseLocation } ) )
} );

export default createSuggestionsSlice;
