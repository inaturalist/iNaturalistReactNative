import inatjs from "inaturalistjs";
import Taxon from "realmModels/Taxon";

import handleError from "./error";

const PARAMS = {
  include_representative_photos: true,
  test_feature: "ancestor_unrestricted",
  fields: {
    combined_score: true,
    vision_score: true,
    taxon: Taxon.LIMITED_TAXON_FIELDS
  }
};

const scoreImage = async (
  params = {},
  opts = {}
): Promise<Object> => {
  try {
    return inatjs.computervision.score_image( { ...PARAMS, ...params }, opts );
  } catch ( e ) {
    return handleError( e as Error, { context: { functionName: "scoreImage", opts } } );
  }
};

export default scoreImage;
