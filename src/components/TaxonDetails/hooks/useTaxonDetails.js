// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

const ANCESTOR_FIELDS = {
  name: true,
  preferred_common_name: true,
  rank: true
};

const PHOTO_FIELDS = {
  id: true,
  attribution: true,
  license_code: true,
  url: true
};

const FIELDS = {
  ancestors: ANCESTOR_FIELDS,
  name: true,
  preferred_common_name: true,
  rank: true,
  taxon_photos: {
    photo: PHOTO_FIELDS
  },
  wikipedia_summary: true,
  wikipedia_url: true
};

const useTaxonDetails = ( id: number ): {
  taxon: ?Object,
  loading: boolean
} => {
  const [taxon, setTaxon] = useState( null );
  const [loading, setLoading] = useState( false );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchTaxonDetails = async ( ) => {
      setLoading( true );
      try {
        const params = {
          fields: FIELDS
        };
        const response = await inatjs.taxa.fetch( id, params );
        const { results } = response;
        if ( !isCurrent ) { return; }
        setTaxon( results[0] );
        setLoading( false );
      } catch ( e ) {
        setLoading( false );
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch taxon details:", e.message );
      }
    };

    fetchTaxonDetails( );
    return ( ) => {
      isCurrent = false;
    };
  }, [id] );

  return { taxon, loading };
};

const useSimilarSpecies = ( id: number ): Array<Object> => {
  const [similarSpecies, setSimilarSpecies] = useState( [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchSimilarSpecies = async ( ) => {
      try {
        const params = {
          per_page: 20,
          taxon_id: id
          // fields: FIELDS
        };
        const response = await inatjs.identifications.similar_species( params );
        const { results } = response;
        if ( !isCurrent ) { return; }
        setSimilarSpecies( results );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch similar species:", e.message );
      }
    };

    fetchSimilarSpecies( );
    return ( ) => {
      isCurrent = false;
    };
  }, [id] );

  return similarSpecies;
};

export {
  useTaxonDetails,
  useSimilarSpecies
};
