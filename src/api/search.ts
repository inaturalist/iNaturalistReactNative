import inatjs from "inaturalistjs";

import handleError from "./error";
import {
  ApiOpts,
  ApiParams,
  ApiPlace,
  ApiProject,
  ApiResponse,
  ApiTaxon,
  ApiUser
} from "./types.d";

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
  sources?: string | string[]
}

const PARAMS: ApiParams = {
  per_page: 10,
  fields: "all"
};

const fetchSearchResults = async (
  params: SearchParams = {},
  opts: ApiOpts = {}
): Promise<( ApiPlace | ApiProject | ApiTaxon | ApiUser )[]> => {
  let response: SearchResponse;
  try {
    response = await inatjs.search( { ...PARAMS, ...params }, opts );
  } catch ( e ) {
    return handleError( e );
  }
  if ( !response ) { return null; }
  const sources = [params.sources].flat();
  const records = response.results?.map( result => {
    if ( sources.length === 0 ) return [result.place, result.project, result.taxon, result.user];
    const results = [];
    if ( sources.includes( "places" ) ) results.push( result.place );
    if ( sources.includes( "projects" ) ) results.push( result.project );
    if ( sources.includes( "taxa" ) ) results.push( result.taxon );
    if ( sources.includes( "users" ) ) results.push( result.user );
    return results;
  } ).flat( ).filter( Boolean );
  return records;
};

export default fetchSearchResults;
