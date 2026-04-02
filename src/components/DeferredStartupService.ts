import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import clearCaches from "sharedHelpers/clearCaches";
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
    const initializeApp = async ( ) => {
    // Run startup tasks when app launches
      if ( realm?.path ) {
        deferTask( "clearCaches", async ( ) => clearCaches( realm ) );
      }
    };
    initializeApp();
  }, [realm] );

  return null;
};

export default DeferredStartupService;
