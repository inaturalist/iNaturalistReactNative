import { SPECIES_COUNTS_VERBOSE_SUMMARY_FIELDS } from "api/fields";
import { fetchSpeciesCounts } from "api/observations";
import type { ApiSpeciesCountVerboseSummary } from "api/types";
import { RealmContext } from "providers/contexts";
import { useEffect, useState } from "react";
import Taxon from "realmModels/Taxon";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useAuthenticatedQuery, useLocationPermission } from "sharedHooks";

import fetchCoarseUserLocation from "../../sharedHelpers/fetchCoarseUserLocation";

const { useRealm } = RealmContext;

// Some of the following code might be repetitive with useTaxon
// since we're storing taxon data to realm in each case
const ONE_WEEK_MS = (
  1000 // ms / s
  * 60 // s / min
  * 60 // min / hr
  * 24 // hr / day
  * 7 // day / wk
);

const useTaxonCommonNames = ( ) => {
  const { hasPermissions } = useLocationPermission( );
  const [userLocation, setUserLocation] = useState( null );

  const params = {
    per_page: 500,
    fields: SPECIES_COUNTS_VERBOSE_SUMMARY_FIELDS,
  };

  if ( userLocation?.latitude ) {
    params.lat = userLocation.latitude;
    params.lng = userLocation.longitude;
  }

  const realm = useRealm( );
  const { data } = useAuthenticatedQuery(
    ["fetchSpeciesCounts", userLocation],
    optsWithAuth => fetchSpeciesCounts<ApiSpeciesCountVerboseSummary>(
      params,
      optsWithAuth,
    ),
    {
      enabled: hasPermissions !== null,
    },
  );

  useEffect( ( ) => {
    const fetchLocation = async ( ) => {
      const location = await fetchCoarseUserLocation( );
      setUserLocation( location );
    };
    if ( hasPermissions ) {
      fetchLocation( );
    }
  }, [hasPermissions] );

  useEffect( ( ) => {
    if ( data?.results ) {
      data.results.forEach( ( { taxon } ) => {
        const taxonId = taxon?.id;
        const localTaxon = taxonId && realm.objectForPrimaryKey( "Taxon", taxonId );
        const missingName = localTaxon
          ? ( !localTaxon.preferred_common_name || !localTaxon.name )
          : false;
        const outOfDate = localTaxon
          ? ( localTaxon._synced_at && ( Date.now( ) - localTaxon._synced_at > ONE_WEEK_MS ) )
          : false;
        const localTaxonNeedsSync = (
          // Definitely sync if there's no local copy
          !localTaxon
            // Sync if the local copy hasn't been synced in a week
            || outOfDate
            // Sync if missing a common name or name
            || missingName
        );

        const mappedTaxon = taxon
          ? Taxon.mapApiToRealm( taxon, realm )
          : null;

        if ( localTaxonNeedsSync ) {
          safeRealmWrite( realm, ( ) => {
            realm.create(
              "Taxon",
              Taxon.forUpdate( mappedTaxon ),
              "modified",
            );
          }, "saving taxon in useTaxonCommonNames" );
        }
      } );
    }
  }, [data, realm] );

  return null;
};

export default useTaxonCommonNames;
