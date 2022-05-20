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
          q,
          sources: "places",
          fields: "place,place.display_name,place.place_type"
        };
        const response = await inatjs.search( params );
        const results = response.results;
        if ( !isCurrent ) { return; }
        setSearchResults( results.map( r => r.place ) );
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
