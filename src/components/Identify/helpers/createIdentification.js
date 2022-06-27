// @flow

import inatjs from "inaturalistjs";

import { getJWTToken } from "../../LoginSignUp/AuthenticationService";

const createIdentification = async ( params: Object ): Promise<?number> => {
  const apiToken = await getJWTToken( false );
  const apiParams = {
    identification: params
  };
  const options = {
    api_token: apiToken
  };
  // additional keys for obs detail id creation:
  // body
  // vision
  // disagreement
  const response = await inatjs.identifications.create( apiParams, options );
  return response.total_results;
};

export default createIdentification;
