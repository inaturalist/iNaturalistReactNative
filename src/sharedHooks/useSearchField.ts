import { useCallback, useState } from "react";
import useDebouncedValue from "sharedHooks/useDebouncedValue";

export interface SearchFieldOptions {
  // Seeds the field with an already-chosen value, e.g. from state the user is
  // looking at. Treated as committed: it's what the field commits if left alone.
  initialText?: string;
  // Whether re-focusing wipes a committed value. Fields that keep a seeded
  // value visible pass false and rely on the input's selectTextOnFocus, so
  // typing replaces the selection instead of appending to it.
  clearOnFocus?: boolean;
}

export interface SearchField {
  // The controlled input value.
  text: string;
  // The debounced value that drives the autocomplete query. Cleared on selection
  // so a chosen suggestion doesn't re-trigger a result list.
  debouncedQuery: string;
  // Whether there's a non-empty query to surface results for.
  hasQuery: boolean;
  // Whether the field still holds a committed or seeded value the user hasn't
  // typed over. Callers use it to keep showing their default options, which are
  // otherwise gated on the field being empty.
  holdsSelection: boolean;
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
const useSearchField = ( {
  initialText = "",
  clearOnFocus = true,
}: SearchFieldOptions = {} ): SearchField => {
  const [text, setText] = useState( initialText );
  const [filledFromSelection, setFilledFromSelection] = useState(
    initialText.length > 0,
  );
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
    if ( !clearOnFocus || !filledFromSelection ) { return; }
    setText( "" );
    setFilledFromSelection( false );
    setImmediately( "" );
  }, [clearOnFocus, filledFromSelection, setImmediately] );

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
    holdsSelection: filledFromSelection,
    onChangeText,
    handleFocus,
    commit,
    clear,
  };
};

export default useSearchField;
