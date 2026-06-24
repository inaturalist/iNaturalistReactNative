import {
  useCallback, useEffect, useRef, useState,
} from "react";

// Debounces a value imperatively: `debounce` schedules an update after a delay
// (replacing any pending one), while `setImmediately` applies a value right away
// and cancels anything pending. Mirrors the inline debounce in MentionTextInput.
const useDebouncedValue = <T, >( initialValue: T, delayMs: number ) => {
  const [debouncedValue, setDebouncedValue] = useState<T>( initialValue );
  const timer = useRef<ReturnType<typeof setTimeout>>( undefined );

  const cancel = useCallback( ( ) => {
    if ( timer.current ) { clearTimeout( timer.current ); }
  }, [] );

  const debounce = useCallback( ( value: T ) => {
    cancel( );
    timer.current = setTimeout( ( ) => setDebouncedValue( value ), delayMs );
  }, [cancel, delayMs] );

  const setImmediately = useCallback( ( value: T ) => {
    cancel( );
    setDebouncedValue( value );
  }, [cancel] );

  useEffect( ( ) => cancel, [cancel] );

  return { debouncedValue, debounce, setImmediately };
};

export default useDebouncedValue;
