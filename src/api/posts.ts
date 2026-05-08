import type { ErrorWithResponse, INatApiError } from "api/error";
import handleError from "api/error";
import inatjs from "inaturalistjs";
import Config from "react-native-config";

const fetchUserPosts = async (
  params: Record<string, unknown> = {},
  opts: Record<string, unknown> = {},
): Promise<Record<string, unknown> | null | ErrorWithResponse | INatApiError> => {
  try {
    inatjs.setConfig( { apiURL: "https://api.inaturalist.org/v1" } );
    const response = await inatjs.posts.for_user( params, opts );
    inatjs.setConfig( { apiURL: Config.API_URL } );
    if ( !response ) { return null; }
    // v1 return
    return response;
    // v2 return
    // return response?.results;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchUserPosts", opts } },
    );
  }
};

export default fetchUserPosts;
