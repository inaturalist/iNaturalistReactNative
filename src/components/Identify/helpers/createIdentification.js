// @flow

import inatjs from "inaturalistjs";

import { getJWTToken } from "../../LoginSignUp/AuthenticationService";

const createIdentification = async ( params: Object ) => {
  const apiToken = await getJWTToken( false );
  try {
    const apiParams = {
      identification: params
    };
    const options = {
      api_token: apiToken
    };
    const response = await inatjs.identifications.create( apiParams, options );
    return response.total_results;
  } catch ( e ) {
    console.log( "Couldn't create identification:", JSON.stringify( e.response ), );
  }
};

export default createIdentification;
