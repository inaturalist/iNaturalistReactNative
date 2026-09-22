import { useCallback, useState } from "react";

// State that goes back to its initial value whenever `key` changes, without an effect and
// without the extra render an effect would cost — the reset happens during the render where
// the new key first appears.
//
// `initial` must be a stable reference since it gets returned after a key change. A fresh object
// every render would defeat memoization in everything downstream.
//
// The value is stored against the key it was written under, so returning to an earlier key
// restores what was set then rather than the initial value. Only the most recent write is
// kept, so this is a one-slot memory, not a history.
const useStateResetOn = <T, >(
  key: unknown,
  initial: T,
): [T, ( next: T ) => void] => {
  const [state, setState] = useState<{ key: unknown; value: T }>( { key, value: initial } );

  const value = state.key === key
    ? state.value
    : initial;

  const setValue = useCallback( ( next: T ) => {
    setState( { key, value: next } );
  }, [key] );

  return [value, setValue];
};

export default useStateResetOn;
