import { INatApiError } from "api/error";
import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import { log } from "sharedHelpers/logger";
import {
  HANDLING_LOCAL_DELETIONS,
  SYNCING_REMOTE_DELETIONS
} from "stores/createDeleteAndSyncObservationsSlice.ts";
import useStore from "stores/useStore";

import syncRemoteDeletedObservations from "../helpers/syncRemoteDeletedObservations";

const logger = log.extend( "useSyncRemoteDeletions" );

const { useRealm } = RealmContext;

const useDeleteLocalObservations = ( currentUserId ): Object => {
  const deletions = useStore( state => state.deletions );
  const setPreUploadStatus = useStore( state => state.setPreUploadStatus );
  const preUploadStatus = useStore( state => state.preUploadStatus );
  const syncType = useStore( state => state.syncType );

  const realm = useRealm( );

  useEffect( ( ) => {
    const beginRemoteDeletions = async ( ) => {
      logger.info( `${syncType} sync #1: syncing remotely deleted observations` );
      try {
        await syncRemoteDeletedObservations( realm );
        setPreUploadStatus( HANDLING_LOCAL_DELETIONS );
      } catch ( syncRemoteError ) {
        // For some reason this seems to run even when signed out, in which
        // case we end up sending no JWT or the anon JWT, wich fails auth. If
        // that happens, we can just return and call it a day.
        if (
          syncRemoteError instanceof INatApiError
            && syncRemoteError?.status === 401
        ) {
          return;
        }
        setPreUploadStatus( HANDLING_LOCAL_DELETIONS );
        throw syncRemoteError;
      }
    };
    if ( preUploadStatus === SYNCING_REMOTE_DELETIONS ) {
      beginRemoteDeletions( );
    }
  }, [
    currentUserId,
    deletions,
    preUploadStatus,
    realm,
    setPreUploadStatus,
    syncType
  ] );
};

export default useDeleteLocalObservations;
