import { StateCreator } from "zustand";

const DEFAULT_STATE = {
  offlineSuggestions: [],
  onlineSuggestions: [],
  suggestionsError: null
};

interface SuggestionsSlice {
  offlineSuggestions: Array<Object>,
  onlineSuggestions: Array<Object>,
  setOfflineSuggestions: ( ) => void,
  setOnlineSuggestions: ( ) => void,
  suggestionsError: boolean,
  setSuggestionsError: ( ) => void
}

const createSuggestionsSlice: StateCreator<SuggestionsSlice> = set => ( {
  ...DEFAULT_STATE,
  setOfflineSuggestions: offlineSuggestions => set( ( ) => ( { offlineSuggestions } ) ),
  setOnlineSuggestions: onlineSuggestions => set( ( ) => ( { onlineSuggestions } ) ),
  setSuggestionsError: suggestionsError => set( ( ) => ( { suggestionsError } ) ),
  resetSuggestionsSlice: ( ) => set( { ...DEFAULT_STATE } )
} );

export default createSuggestionsSlice;
