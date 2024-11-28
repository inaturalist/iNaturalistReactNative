import fetchSearchResults from "api/search.ts";
import type { ApiOpts } from "api/types";
import { RealmContext } from "providers/contexts.ts";
import { useEffect } from "react";
import Realm, { UpdateMode } from "realm";
import Taxon from "realmModels/Taxon";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useAuthenticatedQuery, useIconicTaxa } from "sharedHooks";

const { useRealm } = RealmContext;

// we're already getting all this taxon information anytime we make this API
// call, so we might as well store it in realm. we can remove this if we're
// worried about the cache getting too large
function saveTaxaToRealm( taxa: Taxon[], realm: Realm ) {
  safeRealmWrite( realm, ( ) => {
    taxa.forEach( remoteTaxon => {
      realm.create(
        "Taxon",
        Taxon.forUpdate( remoteTaxon ),
        UpdateMode.Modified
      );
    } );
  }, "saving remote taxon from useTaxonSearch" );
}

const useTaxonSearch = ( taxonQuery = "" ) => {
  const realm = useRealm( );
  const iconicTaxa = useIconicTaxa( { reload: false } );

  const { data: remoteTaxa, refetch, isLoading } = useAuthenticatedQuery(
    ["fetchTaxonSuggestions", taxonQuery],
    async ( optsWithAuth: ApiOpts ) => {
      const apiTaxa = await fetchSearchResults(
        {
          q: taxonQuery,
          sources: "taxa",
          fields: {
            taxon: Taxon.LIMITED_TAXON_FIELDS
          }
        },
        optsWithAuth
      );
      return apiTaxa?.map( taxon => Taxon.mapApiToRealm( taxon ) ) || [];
    },
    {
      enabled: !!( taxonQuery.length > 0 )
    }
  );

  useEffect( ( ) => {
    if ( realm && remoteTaxa?.length > 0 ) {
      saveTaxaToRealm( remoteTaxa, realm );
    }
  }, [realm, remoteTaxa] );

  // Show iconic taxa by default
  if ( taxonQuery.length === 0 ) {
    return {
      taxa: iconicTaxa,
      refetch: ( ) => undefined,
      isLoading: false,
      isLocal: false
    };
  }

  if (
    taxonQuery.length > 0
    && !isLoading
    && ( !remoteTaxa || remoteTaxa.length === 0 )
  ) {
    const localTaxa = realm.objects( "Taxon" ).filtered(
      // "name TEXT $0"
      // + " || preferredCommonName TEXT $0"
      // + " || name CONTAINS[c] $0"

      // "name CONTAINS[c] $0"
      // + " || preferredCommonName CONTAINS[c] $0"

      "_searchableName TEXT $0 || _searchableName CONTAINS[c] $0"

      + " LIMIT(50)",
      taxonQuery
    );
    return {
      taxa: localTaxa,
      refetch: ( ) => undefined,
      isLoading: false,
      isLocal: true
    };
  }

  return {
    taxa: remoteTaxa,
    refetch,
    isLoading,
    isLocal: false
  };
};

export default useTaxonSearch;
