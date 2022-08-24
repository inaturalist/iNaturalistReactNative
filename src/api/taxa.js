// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

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

const params = {
  fields: FIELDS
};

const fetchTaxa = async ( id: number ): Promise<any> => {
  try {
    const { results } = await inatjs.taxa.fetch( id, params );
    return results[0];
  } catch ( e ) {
    return handleError( e );
  }
};

export default fetchTaxa;
