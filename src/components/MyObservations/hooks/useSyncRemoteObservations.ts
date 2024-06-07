import { deactivateKeepAwake } from "@sayem314/react-native-keep-awake";
import { searchObservations } from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import { RealmContext } from "providers/contexts";
import {
  useCallback, useEffect,
  useMemo
} from "react";
import Observation from "realmModels/Observation";
import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { sleep } from "sharedHelpers/util";
import { useCurrentUser } from "sharedHooks";
import {
  DELETE_AND_SYNC_COMPLETE,
  FETCHING_IN_PROGRESS
} from "stores/createDeleteAndSyncObservationsSlice.ts";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

const logger = log.extend( "useSyncRemoteObservations" );

export default useSyncRemoteObservations = ( ) => {
  const deletionsCompletedAt = useStore( s => s.deletionsCompletedAt );
  const setPreUploadStatus = useStore( s => s.setPreUploadStatus );
  const preUploadStatus = useStore( state => state.preUploadStatus );

  const currentUser = useCurrentUser( );
  const realm = useRealm( );

  const params = useMemo( ( ) => ( {
    user_id: currentUser?.id,
    per_page: 50,
    fields: Observation.FIELDS,
    ttl: -1
  } ), [currentUser?.id] );

  const downloadRemoteObservationsFromServer = useCallback( async ( ) => {
    const apiToken = await getJWT( );
    // Between elasticsearch update time and API caches, there's no absolute
    // guarantee fetching observations won't include something we just
    // deleted, so we check to see if deletions recently completed and if
    // they did, make sure 10s have elapsed since deletions complated before
    // fetching new obs
    if ( deletionsCompletedAt ) {
      const msSinceDeletionsCompleted = ( new Date( ) - deletionsCompletedAt );
      if ( msSinceDeletionsCompleted < 5_000 ) {
        const naptime = 10_000 - msSinceDeletionsCompleted;
        logger.info(
          "finished deleting "
          + `recently deleted, waiting ${naptime} ms to download remote observations`
        );
        await sleep( naptime );
      }
    }
    const { results } = await searchObservations( params, { api_token: apiToken } );
    logger.info(
      "fetched remote observations from server with",
      results.length,
      "results, upserting..."
    );
    await Observation.upsertRemoteObservations( results, realm );
  }, [
    params,
    deletionsCompletedAt,
    realm
  ] );

  const updateSyncTime = useCallback( ( ) => {
    const localPrefs = realm?.objects( "LocalPreferences" )[0];
    const updatedPrefs = {
      ...localPrefs,
      last_sync_time: new Date( )
    };
    safeRealmWrite( realm, ( ) => {
      realm.create( "LocalPreferences", updatedPrefs, "modified" );
    }, "updating sync time in useSyncRemoteObservations" );
  }, [realm] );

  const syncObservations = useCallback( async ( ) => {
    setPreUploadStatus( FETCHING_IN_PROGRESS );

    await downloadRemoteObservationsFromServer( );
    setPreUploadStatus( DELETE_AND_SYNC_COMPLETE );
    updateSyncTime( );
    deactivateKeepAwake( );
  }, [
    downloadRemoteObservationsFromServer,
    updateSyncTime,
    setPreUploadStatus
  ] );

  useEffect( ( ) => {
    if ( preUploadStatus === FETCHING_IN_PROGRESS ) {
      syncObservations( );
    }
  }, [preUploadStatus, syncObservations] );

  return {
    syncObservations
  };
};
