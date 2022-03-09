// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

import { FIELDS } from "../../../providers/helpers";

const useObservations = ( placeId: ?string, taxonId: ?number ): {
  observations: Array<Object>,
  loading: boolean
} => {
  const [loading, setLoading] = useState( false );
  const [observations, setObservations] = useState( [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchObservations = async ( ) => {
      setLoading( true );
      try {
        console.log( placeId, "place id in params" );
        const params = {
          // TODO: note that there's a bug with place_id in API v2, so this is not working
          // as of Mar 8, 2022 with a place selected
          // place_id: placeId,
          reviewed: false,
          taxon_id: taxonId,
          // viewer_id: 1132118,
          // locale: null,
          // ttl: -1,
          // order_by: "random",
          // quality_grade: "any",
          // page: 1,
          // user_id: userLogin,
          // per_page: 30,
          fields: FIELDS
        };
        const response = await inatjs.observations.search( params );
        const results = response.results;
        if ( !isCurrent ) { return; }
        setLoading( false );
        setObservations( results );
      } catch ( e ) {
        setLoading( false );
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch observations for identify:", JSON.stringify( e.response ), );
      }
    };

    if ( !taxonId ) { return; }
    // if ( placeId ) {
      fetchObservations( );
    // }

    return ( ) => {
      isCurrent = false;
    };
  }, [placeId, taxonId] );

  return {
    observations,
    loading
  };
};

export default useObservations;
