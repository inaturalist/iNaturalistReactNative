import inatjs from "inaturalistjs";

import handleError from "./error";
import type {
  ApiOpts,
  ApiParams,
  ApiPlace,
  ApiProjectSummary,
  ApiResponse,
  ApiTaxon,
  ApiUser,
} from "./types";

interface SearchResultBase {
  score?: number;
  matches?: string[];
}

export type SearchResult =
  | ( SearchResultBase & { type: "place"; place: ApiPlace } )
  | ( SearchResultBase & { type: "project"; project: ApiProjectSummary } )
  | ( SearchResultBase & { type: "taxon"; taxon: ApiTaxon } )
  | ( SearchResultBase & { type: "user"; user: ApiUser } );

interface SearchResponse extends ApiResponse {
  results: SearchResult[];
}

interface SearchParams extends ApiParams {
  q?: string;
  sources?: string | string[];
}

const PARAMS: ApiParams = {
  per_page: 10,
  fields: "all",
};

// Vanilla search wrapper with error handling
const search = async (
  params: SearchParams = {},
  opts: ApiOpts = {},
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
  opts: ApiOpts = {},
): Promise<null | ( ApiPlace | ApiProjectSummary | ApiTaxon | ApiUser )[]> => {
  const response = await search( params, opts );
  if ( !response ) { return null; }
  const sources = [params.sources].flat();
  const records: ( ApiPlace | ApiProjectSummary | ApiTaxon | ApiUser )[] = [];
  response.results.forEach( result => {
    if ( sources.length === 0 ) {
      if ( "place" in result ) records.push( result.place );
      if ( "project" in result ) records.push( result.project );
      if ( "taxon" in result ) records.push( result.taxon );
      if ( "user" in result ) records.push( result.user );
    } else {
      if ( sources.includes( "places" ) && "place" in result ) records.push( result.place );
      if ( sources.includes( "projects" ) && "project" in result ) records.push( result.project );
      if ( sources.includes( "taxa" ) && "taxon" in result ) records.push( result.taxon );
      if ( sources.includes( "users" ) && "user" in result ) records.push( result.user );
    }
  } );
  return records;
};

export { fetchSearchResults, search };
