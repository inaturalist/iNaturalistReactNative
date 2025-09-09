import inatjs from "inaturalistjs";

import handleError from "./error";
import type {
  ApiOpts,
  ApiParams,
  ApiPlace,
  ApiProject,
  ApiResponse,
  ApiTaxon,
  ApiUser
} from "./types";

interface SearchResponse extends ApiResponse {
  results: {
    score?: number;
    type?: "place" | "project" | "taxon" | "user";
    matches?: string[];
    place?: ApiPlace;
    project?: ApiProject;
    taxon?: ApiTaxon;
    user?: ApiUser;
  }[]
}

interface SearchParams extends ApiParams {
  q?: string;
  sources?: string | string[]
}

const PARAMS: ApiParams = {
  per_page: 10,
  fields: "all"
};

// Vanilla search wrapper with error handling
const search = async (
  params: SearchParams = {},
  opts: ApiOpts = {}
): Promise<null | SearchResponse> => {
  let response: SearchResponse;
  try {
    response = await inatjs.search( { ...PARAMS, ...params }, opts );
  } catch ( searchError ) {
    handleError( searchError as object );
    // handleError should throw, so in theory this should never happen and
    // this is just to placate typescript
    return null;
  }
  return response;
};

// Hits /search AND maps results so it just returns and array of results
const fetchSearchResults = async (
  params: SearchParams = {},
  opts: ApiOpts = {}
): Promise<null | ( ApiPlace | ApiProject | ApiTaxon | ApiUser )[]> => {
  const response = await search( params, opts );
  if ( !response ) { return null; }
  const sources = [params.sources].flat();
  const records: ( ApiPlace | ApiProject | ApiTaxon | ApiUser )[] = [];
  response.results.forEach( result => {
    if ( sources.length === 0 ) {
      if ( result.place ) records.push( result.place );
      if ( result.project ) records.push( result.project );
      if ( result.taxon ) records.push( result.taxon );
      if ( result.user ) records.push( result.user );
    } else {
      if ( sources.includes( "places" ) && result.place ) records.push( result.place );
      if ( sources.includes( "projects" ) && result.project ) records.push( result.project );
      if ( sources.includes( "taxa" ) && result.taxon ) records.push( result.taxon );
      if ( sources.includes( "users" ) && result.user ) records.push( result.user );
    }
  } );
  return records;
};

export { fetchSearchResults, search };
