// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

const ANCESTOR_FIELDS = {
  name: true,
  preferred_common_name: true,
  rank: true
};

const PHOTO_FIELDS = {
  id: true,
  attribution: true,
  license_code: true,
  url: true
};

const FIELDS = {
  ancestors: ANCESTOR_FIELDS,
  name: true,
  preferred_common_name: true,
  rank: true,
  taxon_photos: {
    photo: PHOTO_FIELDS
  },
  wikipedia_summary: true,
  wikipedia_url: true
};

const useFetchTaxonDetails = ( id: number ): ?Object => {
  const [taxon, setTaxon] = useState( null );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchTaxonDetails = async ( ) => {
      try {
        const params = {
          fields: FIELDS
        };
        const response = await inatjs.taxa.fetch( id, params );
        const results = response.results;
        console.log( results, "results" );
        if ( !isCurrent ) { return; }
        setTaxon( results[0] );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch taxon details:", e.message, );
      }
    };

    fetchTaxonDetails( );
    return ( ) => {
      isCurrent = false;
    };
  }, [id] );

  return taxon;
};

export default useFetchTaxonDetails;
