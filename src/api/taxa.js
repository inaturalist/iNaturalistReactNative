// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const ANCESTOR_FIELDS = {
  name: true,
  preferred_common_name: true,
  rank: true,
  rank_level: true
};

const PHOTO_FIELDS = {
  id: true,
  attribution: true,
  license_code: true,
  url: true
};

// These fields should work with all /taxa endpoints
const FIELDS = {
  ancestor_ids: true,
  default_photo: {
    url: true
  },
  name: true,
  preferred_common_name: true,
  rank: true,
  rank_level: true,
  wikipedia_url: true
};

const PARAMS = {
  fields: FIELDS
};

function mapTaxonPhotoToLocalSchema( taxonPhoto ) {
  taxonPhoto.photo.licenseCode = taxonPhoto.photo.licenseCode
    || taxonPhoto.photo.license_code;
  return taxonPhoto;
}
function mapToLocalSchema( taxon ) {
  taxon.taxonPhotos = taxon?.taxonPhotos?.map( mapTaxonPhotoToLocalSchema );
  taxon.taxon_photos = taxon?.taxon_photos?.map( mapTaxonPhotoToLocalSchema );
  return taxon;
}

async function fetchTaxon(
  id: number | Array<number>,
  params: Object = {},
  opts: Object = {}
): Promise<?Object> {
  try {
    const fetchParams = {
      ...PARAMS,
      ...params,
      fields: {
        ...FIELDS,
        ancestors: ANCESTOR_FIELDS,
        children: ANCESTOR_FIELDS,
        establishment_means: {
          establishment_means: true,
          id: true,
          place: {
            id: true,
            display_name: true
          }
        },
        listed_taxa: {
          establishment_means: true,
          id: true,
          list: {
            title: true
          },
          place: {
            id: true
          }
        },
        taxon_photos: {
          photo: PHOTO_FIELDS
        },
        wikipedia_summary: true
      }
    };
    const response = await inatjs.taxa.fetch( id, fetchParams, opts );
    if ( typeof id === "number" ) {
      const results = response?.results;
      if ( !results || results.length === 0 ) return null;

      return mapToLocalSchema( results[0] );
    }
    return response;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "fetchTaxon", id, opts } } );
  }
}

async function searchTaxa( params: Object = {}, opts: Object = {} ): Promise<?Object> {
  try {
    const searchParams = { ...PARAMS, ...params };
    const { results } = await inatjs.taxa.search( searchParams, opts );
    return results;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "searchTaxa", opts } } );
  }
}

export {
  fetchTaxon,
  searchTaxa
};
