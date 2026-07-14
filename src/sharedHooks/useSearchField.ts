import { useCallback, useState } from "react";
import useDebouncedValue from "sharedHooks/useDebouncedValue";

export interface SearchField {
  // The controlled input value.
  text: string;
  // The debounced value that drives the autocomplete query. Cleared on selection
  // so a chosen suggestion doesn't re-trigger a result list.
  debouncedQuery: string;
  // Whether there's a non-empty query to surface results for.
  hasQuery: boolean;
  // Wire to the input's onChangeText.
  onChangeText: ( text: string ) => void;
  // Wire to the input's onFocus: clears a previously-committed value so the user
  // gets a fresh search when they tap back in.
  handleFocus: ( ) => void;
  // Fill the field from a chosen suggestion (without re-triggering a query).
  commit: ( text: string ) => void;
  // Clear the field entirely (e.g. on reset).
  clear: ( ) => void;
}

// The shared state machine behind a debounced autocomplete search input: text +
// debounced query + "fill on select, clear on re-focus". The Universal Search
// subject field is an instance of this.
const useSearchField = ( ): SearchField => {
  const [text, setText] = useState( "" );
  const [filledFromSelection, setFilledFromSelection] = useState( false );
  const {
    debouncedValue: debouncedQuery,
    debounce,
    setImmediately,
  } = useDebouncedValue( "" );

  const onChangeText = useCallback( ( next: string ) => {
    setText( next );
    setFilledFromSelection( false );
    debounce( next );
  }, [debounce] );

  const handleFocus = useCallback( ( ) => {
    if ( !filledFromSelection ) { return; }
    setText( "" );
    setFilledFromSelection( false );
    setImmediately( "" );
  }, [filledFromSelection, setImmediately] );

  const commit = useCallback( ( next: string ) => {
    setText( next );
    setFilledFromSelection( true );
    setImmediately( "" );
  }, [setImmediately] );

  const clear = useCallback( ( ) => {
    setText( "" );
    setFilledFromSelection( false );
    setImmediately( "" );
  }, [setImmediately] );

  return {
    text,
    debouncedQuery,
    hasQuery: debouncedQuery.trim( ).length > 0,
    onChangeText,
    handleFocus,
    commit,
    clear,
  };
};

export default useSearchField;
