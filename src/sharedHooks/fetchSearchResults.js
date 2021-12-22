// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

// const FIELDS = {
//   record: {
//     name: true
//   }
// };

const useFetchSearchResults = ( q: string, sources: string ): Array<Object> => {
  const [autocomplete, setAutocomplete] = useState( [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchSearchResults = async ( ) => {
      try {
        const params = {
          per_page: 10,
          q,
          // TODO: get fields param working
          sources
        };
        const response = await inatjs.search( params );
        const results = response.results.map( result => result.record );
        if ( !isCurrent ) { return; }
        setAutocomplete( results );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( `Couldn't fetch search results with sources ${sources}:`, e.message, );
      }
    };

    fetchSearchResults( );
    return ( ) => {
      isCurrent = false;
    };
  }, [q, sources] );

  return autocomplete;
};

export default useFetchSearchResults;
