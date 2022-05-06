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
        const params = {
          reviewed: false,
          // viewer_id: 1132118,
          // locale: null,
          // ttl: -1,
          // order_by: "random",
          // quality_grade: "any",
          fields: FIELDS
        };
        if ( placeId ) {
          // $FlowFixMe
          params.place_id = placeId;
        }
        if ( taxonId ) {
          // $FlowFixMe
          params.taxon_id = taxonId;
        }
        // $FlowFixMe
        params.fields.observation_photos.photo.medium_url = true;

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

    // this is for performance, so we're not searching the entire globe and all organisms
    if ( taxonId || placeId ) {
      fetchObservations( );
    }

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
