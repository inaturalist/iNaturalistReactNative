// @flow

import { useEffect, useCallback, useRef, useState } from "react";
import inatjs from "inaturalistjs";

import { FIELDS } from "../../../providers/helpers";
import { getUsername } from "../../../components/LoginSignUp/AuthenticationService";

const useObservations = ( ): {
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
        const params = {
          // viewer_id: user.id,
          // preferred_place_id: 1,
          // locale: null,
          // ttl: -1,
          // order_by: "random",
          // quality_grade: "any",
          // page: 1,
          // user_id: userLogin,
          per_page: 30,
          fields: FIELDS
        };
        const response = await inatjs.observations.search( params );
        console.log( response, "response" );
        const results = response.results;
        if ( !isCurrent ) { return; }
        setLoading( false );
        setObservations( results );
      } catch ( e ) {
        setLoading( false );
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch observations for identify:", e.message, );
      }
    };

    fetchObservations( );
    return ( ) => {
      isCurrent = false;
    };
  }, [] );

  return {
    observations,
    loading
  };
};

export default useObservations;
