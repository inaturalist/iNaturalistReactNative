// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

const FIELDS = {
  default_photo: {
    url: true
  },
  name: true,
  preferred_common_name: true,
  matched_term: true
};

const useFetchTaxaAutocomplete = ( q: string ): Array<Object> => {
  const [autocomplete, setAutocomplete] = useState( [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchTaxaAutocomplete = async ( ) => {
      try {
        const params = {
          q,
          fields: FIELDS
        };
        const response = await inatjs.taxa.autocomplete( params );
        const results = response.results;
        if ( !isCurrent ) { return; }
        setAutocomplete( results );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch taxa autocomplete results:", e.message, );
      }
    };

    fetchTaxaAutocomplete( );
    return ( ) => {
      isCurrent = false;
    };
  }, [q] );

  return autocomplete;
};

export default useFetchTaxaAutocomplete;
