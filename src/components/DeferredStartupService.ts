/**
 * DeferredStartupService
 *
 * A renderless component that schedules non-critical startup work to run
 * during idle periods of the JS event loop, after the initial render and
 * navigation transitions have completed. Hopefully, this improves Time-To-Interactive
 * (TTI) by keeping the JS thread free for layout, painting, and user input
 * during app launch.
 *
 * Uses requestIdleCallback to schedule each task in its own callback so the
 * runtime can interleave user interactions between them.
 *
 */

import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import {
  clearComputerVisionPhotos,
  clearGalleryPhotos,
  clearRotatedOriginalPhotosDirectory,
  clearSyncedMediaForUpload,
} from "sharedHelpers/clearCaches";
import { log } from "sharedHelpers/logger";

const { useRealm } = RealmContext;
const logger = log.extend( "DeferredStartupService" );
const deferTask = (
  name: string,
  run: () => Promise<void>,
): number => requestIdleCallback( async ( ) => {
  const start = Date.now( );
  try {
    await run( );
    const duration = Date.now( ) - start;
    // These tasks should not be UI blocking, but maybe good to get intel
    // from users devices if some of these tasks are very long running.
    if ( duration > 1000 ) {
      logger.info( `${name} completed in ${duration}ms` );
    } else {
      console.log( `${name} completed in ${duration}ms` );
    }
  } catch ( error ) {
    logger.error( `${name} failed after ${Date.now( ) - start}ms`, error );
  }
} );

const DeferredStartupService = ( ) => {
  const realm = useRealm( );

  useEffect( () => {
    // Each cache directory gets its own idle callback so that we can still have
    // user interactions between potentially slow filesystem operations.
    const id1 = deferTask(
      "clearRotatedOriginalPhotos",
      clearRotatedOriginalPhotosDirectory,
    );
    const id2 = deferTask( "clearGalleryPhotos", clearGalleryPhotos );
    const id3 = deferTask( "clearComputerVisionPhotos", clearComputerVisionPhotos );
    const id4 = deferTask(
      "clearSyncedMediaForUpload",
      ( ) => clearSyncedMediaForUpload( realm ),
    );

    return ( ) => {
      cancelIdleCallback( id1 );
      cancelIdleCallback( id2 );
      cancelIdleCallback( id3 );
      cancelIdleCallback( id4 );
    };
  }, [realm] );

  return null;
};

export default DeferredStartupService;
