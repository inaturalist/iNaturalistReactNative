// @flow

import { fetchTaxon } from "api/taxa";
import i18n from "i18next";
import { RealmContext } from "providers/contexts";
import Taxon from "realmModels/Taxon";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import {
  useAuthenticatedQuery,
  useCurrentUser
} from "sharedHooks";

const { useRealm } = RealmContext;

const ONE_WEEK_MS = (
  1000 // ms / s
  * 60 // s / min
  * 60 // min / hr
  * 24 // hr / day
  * 7 // day / wk
);

// $FlowIgnore
const useTaxon = ( taxon: Object, fetchRemote = true, retryQuery = true ): Object => {
  const realm = useRealm( );
  // taxon id is returned as a string, not a number, from CV model
  const taxonId = Number( taxon?.id );

  const localTaxon = taxonId && realm.objectForPrimaryKey( "Taxon", taxonId );

  const canFetchTaxon = !!taxonId;
  const outOfDate = localTaxon
    ? ( localTaxon._synced_at && ( Date.now( ) - localTaxon._synced_at > ONE_WEEK_MS ) )
    : false;
  const missingRequiredAttributes = localTaxon
    ? (
      !localTaxon.preferred_common_name
      || !localTaxon.default_photo?.url
      || !localTaxon.taxon_photos
    )
    : false;
  const localTaxonNeedsSync = (
    // Definitely sync if there's no local copy
    !localTaxon
    // Sync if the local copy hasn't been synced in a week
    || outOfDate
    // Sync if missing a common name or default photo from being saved in Realm while offline
    || missingRequiredAttributes
  );
  const enabled = !!( canFetchTaxon && fetchRemote && localTaxonNeedsSync );

  const currentUser = useCurrentUser();
  // Use locale in case there is no user session
  const locale = i18n?.language ?? "en";

  const params = {
    fields: Taxon.LIMITED_TAXON_FIELDS,
    ...( !currentUser && { locale } )
  };

  const {
    data: remoteTaxon,
    error,
    isLoading,
    refetch
  } = useAuthenticatedQuery(
    ["fetchTaxon", taxonId],
    optsWithAuth => fetchTaxon( taxonId, params, optsWithAuth ),
    {
      enabled,
      retry: retryQuery
    }
  );

  const mappedRemoteTaxon = remoteTaxon
    ? Taxon.mapApiToRealm( remoteTaxon, realm )
    : null;

  if ( localTaxonNeedsSync && mappedRemoteTaxon ) {
    safeRealmWrite( realm, ( ) => {
      realm.create(
        "Taxon",
        Taxon.forUpdate( mappedRemoteTaxon ),
        "modified"
      );
    }, "saving remote taxon in useTaxon" );
  }

  // Local is best, local-ish version of remote will be available sooner, use
  // whatever was passed in as a last resort
  return {
    error,
    refetch,
    taxon: localTaxon || mappedRemoteTaxon || taxon,
    // Apparently useQuery isLoading is true if the query is disabled
    isLoading: enabled && isLoading
  };
};

export default useTaxon;
