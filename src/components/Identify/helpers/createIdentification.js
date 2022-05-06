// @flow

import inatjs from "inaturalistjs";

import { getJWTToken } from "../../LoginSignUp/AuthenticationService";

const createIdentification = async ( params: Object ): Promise<?number> => {
  const apiToken = await getJWTToken( false );
  try {
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
  } catch ( e ) {
    console.log( "Couldn't create identification:", JSON.stringify( e.response ), );
  }
};

export default createIdentification;
