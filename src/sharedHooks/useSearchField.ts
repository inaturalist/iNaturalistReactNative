import { useCallback, useState } from "react";
import useDebouncedValue from "sharedHooks/useDebouncedValue";

export interface SearchFieldOptions<T> {
  // Seeds the field with an already-chosen value, e.g. from state the user is
  // looking at. Treated as committed: it's what the field yields if left alone.
  initialValue?: T | null;
  // The label that value shows as, i.e. the field's text until the user types.
  initialText?: string;
}

export interface SearchField<T> {
  // The controlled input value.
  text: string;
  // The chosen value the text stands for, or null when the text is something
  // the user typed. Selecting sets it; typing drops it.
  staged: T | null;
  // The debounced value that drives the autocomplete query. Cleared on selection
  // so a chosen suggestion doesn't re-trigger a result list.
  debouncedQuery: string;
  // Whether there's a non-empty query to surface results for.
  hasQuery: boolean;
  // Whether the text is a search in progress rather than a chosen value, i.e.
  // whether to show results instead of the default options.
  isQuerying: boolean;
  // Wire to the input's onChangeText.
  onChangeText: ( text: string ) => void;
  // Stage a chosen suggestion and show its label (without re-triggering a query).
  select: ( value: T, label: string ) => void;
  // Clear the field entirely (e.g. on reset).
  clear: ( ) => void;
}

// The shared state machine behind a debounced autocomplete search input: text +
// debounced query + the value that text stands for. Text and value move
// together, so the field can never show one thing and yield another. The
// Universal Search subject field is an instance of this.
const useSearchField = <T, >( {
  initialValue = null,
  initialText = "",
}: SearchFieldOptions<T> = {} ): SearchField<T> => {
  const [{ staged, text }, setField] = useState<{ staged: T | null; text: string }>(
    ( ) => ( { staged: initialValue, text: initialText } ),
  );
  const {
    debouncedValue: debouncedQuery,
    debounce,
    setImmediately,
  } = useDebouncedValue( "" );

  const onChangeText = useCallback( ( next: string ) => {
    setField( { staged: null, text: next } );
    debounce( next );
  }, [debounce] );

  const select = useCallback( ( value: T, label: string ) => {
    setField( { staged: value, text: label } );
    setImmediately( "" );
  }, [setImmediately] );

  const clear = useCallback( ( ) => {
    setField( { staged: null, text: "" } );
    setImmediately( "" );
  }, [setImmediately] );

  return {
    text,
    staged,
    debouncedQuery,
    hasQuery: debouncedQuery.trim( ).length > 0,
    isQuerying: staged === null && text.trim( ).length > 0,
    onChangeText,
    select,
    clear,
  };
};

export default useSearchField;
