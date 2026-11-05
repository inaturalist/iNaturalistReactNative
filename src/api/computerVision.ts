import inatjs from "inaturalistjs";
import Taxon from "realmModels/Taxon";
import type { ScoreImageFile } from "sharedHooks/useSuggestions/types";

import type { ErrorWithResponse, INatApiError } from "./error";
import handleError from "./error";
import type {
  ApiDefaultResult, ApiOpts, ApiParams, ApiResponse,
} from "./types";

const PARAMS = {
  include_representative_photos: true,
  test_feature: "ancestor_unrestricted",
  fields: {
    combined_score: true,
    vision_score: true,
    taxon: Taxon.LIMITED_TAXON_FIELDS,
  },
} as const;

interface ScoreImageApiParams extends ApiParams {
  image?: ScoreImageFile;
  lat?: number;
  lng?: number;
  locale?: string;
}

const scoreImage = async <T = ApiDefaultResult>(
  params: ScoreImageApiParams = {},
  opts: ApiOpts = {},
): Promise<ApiResponse<T> | null | ErrorWithResponse | INatApiError> => {
  try {
    const response = await inatjs.computervision.score_image( { ...PARAMS, ...params }, opts );
    if ( !response ) { return null; }
    return response;
  } catch ( e ) {
    return handleError( e as Error, { context: { functionName: "scoreImage", opts } } );
  }
};

export default scoreImage;
