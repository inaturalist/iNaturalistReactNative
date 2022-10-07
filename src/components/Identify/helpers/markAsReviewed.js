// @flow

import { getJWTToken } from "components/LoginSignUp/AuthenticationService";
import inatjs from "inaturalistjs";

const markAsReviewed = async ( id: number ) => {
  const apiToken = await getJWTToken( false );
  try {
    const params = { id };
    const options = {
      api_token: apiToken
    };
    await inatjs.observations.review( params, options );
  } catch ( e ) {
    console.log( "Couldn't mark obs as reviewed:", JSON.stringify( e.response ) );
  }
};

export default markAsReviewed;
