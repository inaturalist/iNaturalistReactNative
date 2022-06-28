// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

const useRemoteSearchResults = ( q: string, sources: string, fields: string ): Array<Object> => {
  const [searchResults, setSearchResults] = useState( [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchSearchResults = async ( ) => {
      try {
        const params = {
          per_page: 10,
          q,
          sources,
          fields: fields || "all"
        };
        const { results } = await inatjs.search( params );
        const records = results.map( result => {
          if ( sources === "taxa" ) {
            return result.taxon;
          }
          if ( sources === "places" ) {
            return result.place;
          }
          if ( sources === "users" ) {
            return result.user;
          }
          if ( sources === "projects" ) {
            return result.project;
          }
        } );
        if ( !isCurrent ) { return; }
        setSearchResults( records );
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
  }, [q, sources, fields] );

  return searchResults;
};

export default useRemoteSearchResults;
