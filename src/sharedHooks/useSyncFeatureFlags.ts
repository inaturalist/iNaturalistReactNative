import { useEffect } from "react";
import syncFeatureFlags from "sharedHelpers/syncFeatureFlags";

// Flipper resolves flags per user, so refetch when the signed-in user changes (login / logout)
const useSyncFeatureFlags = ( currentUserId: number | undefined ) => {
  useEffect( ( ) => {
    syncFeatureFlags( );
  }, [currentUserId] );
};

export default useSyncFeatureFlags;
