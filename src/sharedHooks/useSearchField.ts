import { useCallback, useState } from "react";
import useDebouncedValue from "sharedHooks/useDebouncedValue";

export interface SearchFieldOptions {
  // Seeds the field with an already-chosen value, e.g. from state the user is
  // looking at. Treated as committed: it's what the field commits if left alone.
  initialText?: string;
}

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
  // Fill the field from a chosen suggestion (without re-triggering a query).
  commit: ( text: string ) => void;
  // Clear the field entirely (e.g. on reset).
  clear: ( ) => void;
}

// The shared state machine behind a debounced autocomplete search input: text +
// debounced query + "fill on select". The Universal Search subject field is an
// instance of this.
const useSearchField = ( {
  initialText = "",
}: SearchFieldOptions = {} ): SearchField => {
  const [text, setText] = useState( initialText );
  const {
    debouncedValue: debouncedQuery,
    debounce,
    setImmediately,
  } = useDebouncedValue( "" );

  const onChangeText = useCallback( ( next: string ) => {
    setText( next );
    debounce( next );
  }, [debounce] );

  const commit = useCallback( ( next: string ) => {
    setText( next );
    setImmediately( "" );
  }, [setImmediately] );

  const clear = useCallback( ( ) => {
    setText( "" );
    setImmediately( "" );
  }, [setImmediately] );

  return {
    text,
    debouncedQuery,
    hasQuery: debouncedQuery.trim( ).length > 0,
    onChangeText,
    commit,
    clear,
  };
};

export default useSearchField;
