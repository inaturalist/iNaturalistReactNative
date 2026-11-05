import { useEffect } from "react";
import syncFeatureFlags from "sharedHelpers/syncFeatureFlags";

// Flipper resolves flags per user, so refetch whenever the signed-in user changes
const useSyncFeatureFlags = ( currentUserId: number | undefined ) => {
  useEffect( ( ) => {
    syncFeatureFlags( );
  }, [currentUserId] );
};

export default useSyncFeatureFlags;
