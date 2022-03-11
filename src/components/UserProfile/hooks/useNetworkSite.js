// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

const FIELDS = {
  title: true,
  icon: true
};

const useNetworkSite = ( ): Array<Object> => {
  // const [projects, setProjects] = useState( [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchSite = async ( ) => {
      try {
        // const params = {
        //   per_page: 10,
        //   id: userId,
        //   fields: FIELDS
        // };
        const response = await inatjs.sites.fetch( );
        const { results } = response;
        console.log( response, "response sites" );
        if ( !isCurrent ) { return; }
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch network sites:", e.message, );
      }
    };

    fetchSite( );

    return ( ) => {
      isCurrent = false;
    };
  }, [] );

  return [];
};

export default useNetworkSite;
