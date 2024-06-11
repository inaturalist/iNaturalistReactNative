import { searchObservations } from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import Observation from "realmModels/Observation";
import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { sleep } from "sharedHelpers/util";

const logger = log.extend( "syncRemoteObservations.ts" );

const updateSyncTime = realm => {
  const localPrefs = realm.objects( "LocalPreferences" )[0];
  const updatedPrefs = {
    ...localPrefs,
    last_sync_time: new Date( )
  };
  safeRealmWrite( realm, ( ) => {
    realm.create( "LocalPreferences", updatedPrefs, "modified" );
  }, "updating sync time in MyObservationsContainer" );
};

export default syncRemoteObservations = async ( realm, currentUserId, deletionsCompletedAt ) => {
  const apiToken = await getJWT( );
  const searchParams = {
    user_id: currentUserId,
    per_page: 50,
    fields: Observation.LIST_FIELDS,
    ttl: -1
  };
  // Between elasticsearch update time and API caches, there's no absolute
  // guarantee fetching observations won't include something we just
  // deleted, so we check to see if deletions recently completed and if
  // they did, make sure 10s have elapsed since deletions complated before
  // fetching new obs
  if ( deletionsCompletedAt ) {
    const msSinceDeletionsCompleted = ( new Date( ) - deletionsCompletedAt );
    if ( msSinceDeletionsCompleted < 5_000 ) {
      const naptime = 10_000 - msSinceDeletionsCompleted;
      logger.debug(
        "downloadRemoteObservationsFromServer finished deleting "
        + `recently deleted, waiting ${naptime} ms`
      );
      await sleep( naptime );
    }
  }
  logger.debug(
    "downloadRemoteObservationsFromServer, fetching observations"
  );
  const { results } = await searchObservations( searchParams, { api_token: apiToken } );
  logger.debug(
    "downloadRemoteObservationsFromServer, fetched",
    results.length,
    "results, upserting..."
  );
  await Observation.upsertRemoteObservations( results, realm );
  updateSyncTime( realm );
};
