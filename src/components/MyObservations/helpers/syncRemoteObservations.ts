import { searchObservations } from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService.ts";
import Observation from "realmModels/Observation";
import { sleep } from "sharedHelpers/util.ts";

// eslint-disable-next-line no-undef
export default syncRemoteObservations = async ( realm, currentUserId, deletionsCompletedAt ) => {
  console.log( "[DEBUG syncRemoteObservations.ts] calling getJWT" );
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
      await sleep( naptime );
    }
  }
  const { results } = await searchObservations( searchParams, { api_token: apiToken } );
  await Observation.upsertRemoteObservations( results, realm );
};
