import { useNavigation } from "@react-navigation/native";
import { activateKeepAwake, deactivateKeepAwake } from "@sayem314/react-native-keep-awake";
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
import { useCurrentUser } from "sharedHooks";
import {
  FETCHING_COMPLETE,
  FETCHING_REMOTE_OBSERVATIONS
} from "stores/createDeleteObservationsSlice.ts";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

const logger = log.extend( "useSyncRemoteObservations" );

export default useSyncRemoteObservations = ( ) => {
  const navigation = useNavigation( );
  const deletionsCompletedAt = useStore( s => s.deletionsCompletedAt );
  const setPreUploadStatus = useStore( s => s.setPreUploadStatus );

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
          "downloadRemoteObservationsFromServer finished deleting "
          + `recently deleted, waiting ${naptime} ms`
        );
        await sleep( naptime );
      }
    }
    logger.info(
      "downloadRemoteObservationsFromServer, fetching observations"
    );
    const { results } = await searchObservations( params, { api_token: apiToken } );
    logger.info(
      "downloadRemoteObservationsFromServer, fetched",
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
    const localPrefs = realm.objects( "LocalPreferences" )[0];
    const updatedPrefs = {
      ...localPrefs,
      last_sync_time: new Date( )
    };
    safeRealmWrite( realm, ( ) => {
      realm.create( "LocalPreferences", updatedPrefs, "modified" );
    }, "updating sync time in useSyncRemoteObservations" );
  }, [realm] );

  const syncObservations = useCallback( async ( ) => {
    activateKeepAwake( );
    setPreUploadStatus( FETCHING_REMOTE_OBSERVATIONS );

    await downloadRemoteObservationsFromServer( );
    setPreUploadStatus( FETCHING_COMPLETE );
    updateSyncTime( );
    deactivateKeepAwake( );
  }, [
    downloadRemoteObservationsFromServer,
    updateSyncTime,
    setPreUploadStatus
  ] );

  useEffect(
    ( ) => {
      navigation.addListener( "focus", ( ) => {
        syncObservations( );
      } );
    },
    [
      navigation,
      syncObservations
    ]
  );

  return {
    syncObservations
  };
};
