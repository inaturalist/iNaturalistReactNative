import { useCallback } from "react";
import useLayoutPrefs from "sharedHooks/useLayoutPrefs";

/**
 * If a user logs in and their account has at least this many
 * uploaded observations, auto-switch to advanced mode
 */
export const AUTO_ADVANCED_MODE_OBSERVATION_THRESHOLD = 100;

// Layout preferences set after any successful sign-in
const useApplySignInPrefs = ( ) => {
  const { isDefaultMode, setIsDefaultMode, setLoggedInWhileInDefaultMode } = useLayoutPrefs( );

  return useCallback( ( observationsCount?: number ) => {
    if ( observationsCount && observationsCount >= AUTO_ADVANCED_MODE_OBSERVATION_THRESHOLD ) {
      // If a user that just logged in already has at least the threshold number of observations,
      // we assume they are an advanced user and switch them to advanced mode.
      setIsDefaultMode( false );
    } else {
      // Record whether the user was in default mode when they logged in
      setLoggedInWhileInDefaultMode( isDefaultMode );
    }
  }, [isDefaultMode, setIsDefaultMode, setLoggedInWhileInDefaultMode] );
};

export default useApplySignInPrefs;
