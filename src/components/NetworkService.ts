import { log } from "sharedHelpers/logger";
import {
  useIconicTaxa,
  useObservationUpdatesWhenFocused, usePerformance,
} from "sharedHooks";
import { isDebugMode } from "sharedHooks/useDebugMode";

import useTaxonCommonNames from "./hooks/useTaxonCommonNames";
import useWorkQueue from "./hooks/useWorkQueue";

const logger = log.extend( "NetworkService" );

const NetworkService = ( ) => {
  const { loadTime } = usePerformance( {
    screenName: "NetworkService",
    isLoading: false,
  } );
  if ( isDebugMode( ) ) {
    logger.info( loadTime );
  }

  useObservationUpdatesWhenFocused( );

  useIconicTaxa( { reload: true } );
  // This only runs when App updates... which is rarely. It works for Settings
  // b/c it generally updates currentUser
  useWorkQueue( );
  useTaxonCommonNames( );

  return null;
};

export default NetworkService;
