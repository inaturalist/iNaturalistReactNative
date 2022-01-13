// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

// const FIELDS = {
//   record: {
//     name: true
//   }
// };

const useRemoteSearchResults = ( q: string, sources: string ): Array<Object> => {
  const [searchResults, setSearchResults] = useState( [] );

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
        setSearchResults( results );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( `Couldn't fetch search results with sources ${sources}:`, e.message, );
      }
    };

    // don't bother to fetch search results if there isn't a query
    if ( q === "" ) { return; }
    fetchSearchResults( );
    return ( ) => {
      isCurrent = false;
    };
  }, [q, sources] );

  return searchResults;
};

export default useRemoteSearchResults;
