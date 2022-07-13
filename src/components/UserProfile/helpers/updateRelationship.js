// @flow

import inatjs from "inaturalistjs";

import { getJWTToken } from "../../LoginSignUp/AuthenticationService";

const updateRelationship = async ( params: Object ) => {
  const apiToken = await getJWTToken( false );
  try {
    const options = {
      api_token: apiToken
    };
    const response = await inatjs.relationships.update( params, options );
    console.log( response, "response update relationship" );
  } catch ( e ) {
    console.log( "Couldn't update relationship:", JSON.stringify( e.response ) );
  }
};

export default updateRelationship;
