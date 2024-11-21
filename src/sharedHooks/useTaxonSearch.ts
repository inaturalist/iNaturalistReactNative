import fetchSearchResults from "api/search.ts";
import { RealmContext } from "providers/contexts.ts";
import { useEffect } from "react";
import Taxon from "realmModels/Taxon";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useAuthenticatedQuery } from "sharedHooks";

const { useRealm } = RealmContext;

// we're already getting all this taxon information anytime we make this API
// call, so we might as well store it in realm. we can remove this if we're
// worried about the cache getting too large
function saveTaxaToRealm( taxa, realm ) {
  safeRealmWrite( realm, ( ) => {
    taxa.forEach( remoteTaxon => {
      realm.create(
        "Taxon",
        { ...remoteTaxon, _synced_at: new Date( ) },
        "modified"
      );
    } );
  }, "saving remote taxon from useTaxonSearch" );
}

const useTaxonSearch = ( taxonQuery: string ): Object => {
  const realm = useRealm( );
  const { data: remoteTaxa, refetch, isLoading } = useAuthenticatedQuery(
    ["fetchTaxonSuggestions", taxonQuery],
    async optsWithAuth => {
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
      return apiTaxa.map( Taxon.mapApiToRealm );
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

  if ( !isLoading && ( !remoteTaxa || remoteTaxa.length === 0 ) ) {
    const localTaxa = realm.objects( "Taxon" ).filtered(
      "name CONTAINS[c] $0 || preferredCommonName CONTAINS[c] $0 LIMIT(50)",
      taxonQuery
    );
    return {
      taxa: localTaxa,
      refetch: ( ) => undefined,
      isLoading: false
    };
  }

  return { taxa: remoteTaxa, refetch, isLoading };
};

export default useTaxonSearch;
