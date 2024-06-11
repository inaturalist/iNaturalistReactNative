import {
  checkForDeletedObservations
} from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import { format } from "date-fns";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

const setParamsWithLastSyncTime = realm => {
  const lastSyncTime = realm.objects( "LocalPreferences" )?.[0]?.last_deleted_sync_time;
  const deletedParams = { since: format( new Date( ), "yyyy-MM-dd" ) };
  if ( lastSyncTime ) {
    try {
      deletedParams.since = format( lastSyncTime, "yyyy-MM-dd" );
    } catch ( lastSyncTimeFormatError ) {
      if ( lastSyncTimeFormatError instanceof RangeError ) {
        // If we can't parse that date, assume we've never synced and use the default
      } else {
        throw lastSyncTimeFormatError;
      }
    }
  }
  return deletedParams;
};

const deleteRemotelyDeletedObservations = ( deletedObservations, realm ) => {
  if ( !deletedObservations ) { return; }
  if ( deletedObservations?.length > 0 ) {
    safeRealmWrite( realm, ( ) => {
      const localObservationsToDelete = realm.objects( "Observation" )
        .filtered( `id IN { ${deletedObservations} }` );
      localObservationsToDelete.forEach( observation => {
        realm.delete( observation );
      } );
    }, "removing remotely deleted observations from realm" );
  }
};

const updateDeletedSyncTime = realm => {
  const localPrefs = realm.objects( "LocalPreferences" )[0];
  const updatedPrefs = {
    ...localPrefs,
    last_deleted_sync_time: new Date( )
  };
  safeRealmWrite( realm, ( ) => {
    realm.create( "LocalPreferences", updatedPrefs, "modified" );
  }, "updating last remotely deleted sync time" );
};

export default syncRemoteDeletedObservations = async realm => {
  const apiToken = await getJWT( );
  const deletedParams = setParamsWithLastSyncTime( realm );
  console.log( deletedParams, "deleted params" );
  const response = await checkForDeletedObservations( deletedParams, { api_token: apiToken } );
  console.log( response, "response" );
  updateDeletedSyncTime( realm );
  const deletedObservations = response?.results;
  deleteRemotelyDeletedObservations( deletedObservations, realm );
};
