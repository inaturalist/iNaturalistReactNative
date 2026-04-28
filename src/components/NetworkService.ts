import { useEffect } from "react";
import { log } from "sharedHelpers/logger";
import {
  useIconicTaxa,
  useObservationUpdatesWhenFocused, usePerformance,
} from "sharedHooks";
import useDebugMode from "sharedHooks/useDebugMode";

import useTaxonCommonNames from "./hooks/useTaxonCommonNames";
import useWorkQueue from "./hooks/useWorkQueue";

const logger = log.extend( "NetworkService" );

const NetworkService = ( ) => {
  const { loadTime } = usePerformance( {
    screenName: "NetworkService",
    isLoading: false,
  } );
  const { isDebug } = useDebugMode();
  useEffect( () => {
    if ( isDebug && loadTime ) {
      logger.info( loadTime );
    }
  }, [isDebug, loadTime] );

  useObservationUpdatesWhenFocused( );

  useIconicTaxa( { reload: true } );
  // This only runs when App updates... which is rarely. It works for Settings
  // b/c it generally updates currentUser
  useWorkQueue( );
  useTaxonCommonNames( );

  return null;
};

export default NetworkService;
