import inatjs from "inaturalistjs";
import {useEffect, useState} from "react";

const usePlaces = ( q: string ): Array<Object> => {
  const [searchResults, setSearchResults] = useState( [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchSearchResults = async ( ) => {
      try {
        const params = {
          per_page: 10,
          q
        };
        const response = await inatjs.places.autocomplete( params );
        const results = response.results;
        if ( !isCurrent ) { return; }
        setSearchResults( results );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch search results:", e.message, );
      }
    };

    // don't bother to fetch search results if there isn't a query
    if ( q === "" ) { return; }
    fetchSearchResults( );
    return ( ) => {
      isCurrent = false;
    };
  }, [q] );

  return searchResults;
};

export default usePlaces;
