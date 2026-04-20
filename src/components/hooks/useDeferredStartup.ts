/**
 * useDeferredStartup
 *
 * Schedules non-critical startup work to run during idle periods of the JS
 * event loop, after the initial render and navigation transitions have
 * completed. Hopefully, this improves Time-To-Interactive (TTI) by keeping
 * the JS thread free for layout, painting, and user input during app launch.
 *
 * Uses requestIdleCallback to schedule each task in its own callback so the
 * runtime can interleave user interactions between them.
 */
import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import {
  clearComputerVisionPhotos,
  clearGalleryPhotos,
  clearRollbackPhotos,
  clearRotatedOriginalPhotosDirectory,
  clearSyncedMediaForUpload,
} from "sharedHelpers/clearCaches";
import { log } from "sharedHelpers/logger";
import { logSentinelFiles } from "sharedHelpers/sentinelFiles";
import getStorageMetrics from "sharedHelpers/storageMetrics";
import { zustandStorage } from "stores/useStore";

const { useRealm } = RealmContext;
const logger = log.extend( "useDeferredStartup" );

/**
 * Schedule a single async task to run during the next idle period.
 *
 * @param name    - Human-readable task name for logging.
 * @param run     - Async function to execute. Errors are caught and logged,
 *                  never propagated, so one task cannot break another.
 * @param timeout - Optional. If provided, guarantees the callback fires
 *                  within this many ms even if the thread stays busy.
 *                  Use for tasks that *must* eventually complete. Omit for
 *                  tasks where skipping is acceptable.
 * @returns         The idle callback ID (pass to cancelIdleCallback to cancel).
 */
const deferTask = (
  name: string,
  run: () => Promise<void>,
  timeout?: number,
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
}, timeout
  ? { timeout }
  : undefined );

const checkForPreviousCrash = async () => {
  try {
    const crashData = zustandStorage.getItem( "LAST_CRASH_DATA" );
    if ( crashData ) {
      const parsedData = JSON.parse( crashData.toString() );
      logger.error( "Last Crash Data:", JSON.stringify( parsedData ) );
      zustandStorage.removeItem( "LAST_CRASH_DATA" );
    }
  } catch ( e ) {
    logger.error( "Failed to process previous crash data", e );
  }
};

const useDeferredStartup = ( ) => {
  const realm = useRealm( );

  useEffect( ( ) => {
    // Diagnostic tasks that we need to finish even on a busy thread
    // should have a timeout to ensure they run eventually.
    const id1 = deferTask( "checkForPreviousCrash", checkForPreviousCrash, 30000 );
    const id2 = deferTask( "logSentinelFiles", logSentinelFiles, 30000 );
    const id3 = deferTask( "logStorageMetrics", async () => {
      const metrics = await getStorageMetrics( realm?.path );
      logger.infoWithExtra( "storage_metrics", metrics );
    }, 30000 );

    // Each cache directory gets its own idle callback so that we can still have
    // user interactions between potentially slow filesystem operations.
    const id4 = deferTask( "clearRotatedOriginalPhotos", clearRotatedOriginalPhotosDirectory );
    const id5 = deferTask( "clearGalleryPhotos", clearGalleryPhotos );
    const id6 = deferTask( "clearComputerVisionPhotos", clearComputerVisionPhotos );
    const id7 = deferTask( "clearSyncedMediaForUpload", () => clearSyncedMediaForUpload( realm ) );
    const id8 = deferTask( "clearRollbackPhotos", clearRollbackPhotos );

    return ( ) => {
      cancelIdleCallback( id1 );
      cancelIdleCallback( id2 );
      cancelIdleCallback( id3 );
      cancelIdleCallback( id4 );
      cancelIdleCallback( id5 );
      cancelIdleCallback( id6 );
      cancelIdleCallback( id7 );
      cancelIdleCallback( id8 );
    };
  }, [realm] );
};

export default useDeferredStartup;
