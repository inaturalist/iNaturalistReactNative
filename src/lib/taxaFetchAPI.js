// @flow

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

const fetchTaxa = async ( id: number ): Promise<any> => {
  const params = {
    fields: FIELDS
  };

  try {
    const { results } = await inatjs.taxa.fetch( id, params );
    return results[0];
  } catch ( e ) {
    throw new Error( JSON.stringify( e.response ) );
  }
};

export default fetchTaxa;
