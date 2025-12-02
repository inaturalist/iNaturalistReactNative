import { useMemo } from "react";

const simultaneousOnlineOfflineSuggestionsEnabled = false;
const simultaneousOnlineOfflinePercentageChance = 1;

const useShouldFetchOfflineSuggestionsUnconditionally = ( ) => {
  const fetchOfflineSuggestionsUnconditionally = useMemo(
    () => {
      if ( !simultaneousOnlineOfflineSuggestionsEnabled ) {
        return false;
      }
      return Math.random() <= simultaneousOnlineOfflinePercentageChance;
    },
    // This is not exactly x% of suggs but it should be close enough?
    // The Screen component is reused across AI Cam uses and doesn't necessarily
    // rerender so this would be all suggs on x% of Screen mounts.
    []
  );
  return fetchOfflineSuggestionsUnconditionally;
};

export default useShouldFetchOfflineSuggestionsUnconditionally;
