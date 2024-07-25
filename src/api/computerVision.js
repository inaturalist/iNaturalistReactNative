// @flow

import inatjs from "inaturalistjs";
import Taxon from "realmModels/Taxon";

import handleError from "./error";

const PARAMS = {
  fields: {
    combined_score: true,
    taxon: Taxon.SCORE_IMAGE_FIELDS
  }
};

const scoreImage = async (
  params: Object = {},
  opts: Object = {}
): Promise<?Object> => {
  try {
    return inatjs.computervision.score_image( { ...PARAMS, ...params }, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

export default scoreImage;
