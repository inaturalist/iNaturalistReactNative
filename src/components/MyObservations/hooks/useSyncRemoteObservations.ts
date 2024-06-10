import { searchObservations } from "api/observations";
import { RealmContext } from "providers/contexts";
import {
  useCallback, useEffect, useState
} from "react";
import Observation from "realmModels/Observation";
import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { sleep } from "sharedHelpers/util";
import { useAuthenticatedQuery } from "sharedHooks";
import {
  AUTOMATIC_SYNC,
  AUTOMATIC_SYNC_COMPLETE,
  FETCHING_REMOTE_OBSERVATIONS,
  USER_INITIATED_SYNC_COMPLETE
} from "stores/createDeleteAndSyncObservationsSlice.ts";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

const logger = log.extend( "useSyncRemoteObservations" );

export default useSyncRemoteObservations = currentUserId => {
  const deletionsCompletedAt = useStore( s => s.deletionsCompletedAt );
  const setPreUploadStatus = useStore( s => s.setPreUploadStatus );
  const preUploadStatus = useStore( state => state.preUploadStatus );
  const syncType = useStore( state => state.syncType );
  const [canFetch, setCanFetch] = useState( false );
  const [syncTypeInFlight, setSyncTypeInFlight] = useState( AUTOMATIC_SYNC );

  useEffect( ( ) => {
    const waitForSleep = async naptime => {
      const readyToFetch = await sleep( naptime );
      if ( readyToFetch ) {
        setCanFetch( true );
      }
    };
    if ( deletionsCompletedAt ) {
      // Between elasticsearch update time and API caches, there's no absolute
      // guarantee fetching observations won't include something we just
      // deleted, so we check to see if deletions recently completed and if
      // they did, make sure 10s have elapsed since deletions complated before
      // fetching new obs
      const msSinceDeletionsCompleted = ( new Date( ) - deletionsCompletedAt );
      const naptime = 10_000 - msSinceDeletionsCompleted;
      logger.info(
        `${syncType} sync #2.5: recently deleted, waiting ${naptime} ms`
      );
      setSyncTypeInFlight( syncType );
      waitForSleep( naptime );
    } else {
      setSyncTypeInFlight( syncType );
      setCanFetch( true );
    }
  }, [deletionsCompletedAt, syncType] );

  const realm = useRealm( );

  const {
    data,
    isFetched
  } = useAuthenticatedQuery(
    ["searchObservations", currentUserId],
    optsWithAuth => searchObservations(
      {
        user_id: currentUserId,
        per_page: 50,
        fields: Observation.LIST_FIELDS,
        ttl: -1
      },
      optsWithAuth
    ),
    {
      enabled: !!currentUserId
        && preUploadStatus === FETCHING_REMOTE_OBSERVATIONS
        && canFetch
    }
  );

  const results = data?.results;

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

  useEffect( ( ) => {
    if ( preUploadStatus !== FETCHING_REMOTE_OBSERVATIONS ) { return; }
    const syncComplete = syncTypeInFlight === AUTOMATIC_SYNC
      ? AUTOMATIC_SYNC_COMPLETE
      : USER_INITIATED_SYNC_COMPLETE;
    const upsertingRemoteObservations = async ( ) => {
      logger.info(
        `${syncTypeInFlight} sync #3: fetched remote observations from server with`,
        results.length,
        "results, upserting..."
      );
      await Observation.upsertRemoteObservations( results, realm );
      updateSyncTime( );
      setPreUploadStatus( syncComplete );
    };

    if ( !isFetched ) { return; }
    if ( results?.length > 0 ) {
      upsertingRemoteObservations( );
    } else {
      logger.info( "sync #3: no remote observations" );
      updateSyncTime( );
      setPreUploadStatus( syncComplete );
    }
  }, [
    isFetched,
    preUploadStatus,
    realm,
    results,
    setPreUploadStatus,
    syncTypeInFlight,
    updateSyncTime
  ] );

  return null;
};
