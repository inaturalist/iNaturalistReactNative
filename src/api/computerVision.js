// @flow

import inatjs from "inaturalistjs";
import Taxon from "realmModels/Taxon";

import handleError from "./error";

const PARAMS = {
  fields: {
    taxon: Taxon.TAXON_FIELDS
  }
};

const scoreImage = async (
  params: object = {},
  opts: object = {}
): Promise<any> => {
  try {
    return inatjs.computervision.score_image( { ...PARAMS, ...params }, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

export default scoreImage;
