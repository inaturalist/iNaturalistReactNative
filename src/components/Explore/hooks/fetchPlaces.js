// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

const useFetchPlaces = ( q: string ): Array<Object> => {
  const [autocomplete, setAutocomplete] = useState( [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchPlaces = async ( ) => {
      try {
        const params = {
          q
          // fields: FIELDS
        };
        const response = await inatjs.places.autocomplete( params );
        const results = response.results;
        if ( !isCurrent ) { return; }
        setAutocomplete( results );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch places:", e.message, );
      }
    };

    fetchPlaces( );
    return ( ) => {
      isCurrent = false;
    };
  }, [q] );

  return autocomplete;
};

export default useFetchPlaces;
