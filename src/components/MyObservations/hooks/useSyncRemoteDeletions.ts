import { INatApiError } from "api/error";
import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import { log } from "sharedHelpers/logger";
import { useCurrentUser } from "sharedHooks";
import {
  HANDLING_LOCAL_DELETIONS,
  SYNCING_REMOTE_DELETIONS
} from "stores/createDeleteAndSyncObservationsSlice.ts";
import useStore from "stores/useStore";

import syncRemoteDeletedObservations from "../helpers/syncRemoteDeletedObservations";

const logger = log.extend( "useDeleteLocalObservations" );

const { useRealm } = RealmContext;

const useDeleteLocalObservations = ( ): Object => {
  const currentUser = useCurrentUser( );
  const currentUserId = currentUser?.id;
  const deletions = useStore( state => state.deletions );
  const setPreUploadStatus = useStore( state => state.setPreUploadStatus );
  const preUploadStatus = useStore( state => state.preUploadStatus );

  const realm = useRealm( );

  useEffect( ( ) => {
    const beginRemoteDeletions = async ( ) => {
      logger.info( "syncing remotely deleted observations" );
      try {
        await syncRemoteDeletedObservations( realm );
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
        throw syncRemoteError;
      }
      setPreUploadStatus( HANDLING_LOCAL_DELETIONS );
    };
    if ( preUploadStatus === SYNCING_REMOTE_DELETIONS ) {
      beginRemoteDeletions( );
    }
  }, [
    currentUserId,
    deletions,
    preUploadStatus,
    realm,
    setPreUploadStatus
  ] );
};

export default useDeleteLocalObservations;
