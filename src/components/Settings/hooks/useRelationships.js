import inatjs from "inaturalistjs";
import {useEffect, useState} from "react";

const useRelationships = ( accessToken, params ): Array<Object> => {
  const [searchResults, setSearchResults] = useState( [] );
  const [perPage, setPerPage] = useState( 0 );
  const [totalResults, setTotalResults] = useState( 0 );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchSearchResults = async ( ) => {
      try {
        const response = await inatjs.relationships.search( params, {api_token: accessToken} );
        const results = response.results;
        if ( !isCurrent ) { return; }
        setSearchResults( results );
        setPerPage( response.per_page );
        setTotalResults( response.total_results );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch search results:", e.message, );
      }
    };

    // don't bother to fetch search results if there isn't a query
    if ( !accessToken ) { return; }
    fetchSearchResults( );
    return ( ) => {
      isCurrent = false;
    };
  }, [accessToken, params] );

  return [searchResults, perPage, totalResults];
};

export default useRelationships;
