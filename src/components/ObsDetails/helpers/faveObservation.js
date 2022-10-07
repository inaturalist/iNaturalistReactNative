// @flow

import { getJWTToken } from "components/LoginSignUp/AuthenticationService";
import inatjs from "inaturalistjs";

const faveObservation = async ( uuid: string, endpoint: string ): Promise<?number> => {
  const apiToken = await getJWTToken( false );

  try {
    const params = {
      uuid
    };
    const options = {
      api_token: apiToken
    };

    const response = await inatjs.observations[endpoint]( params, options );
    return response.total_results;
  } catch ( e ) {
    console.log( "Couldn't fave observation:", JSON.stringify( e.response ) );
  }
  return 0;
};

export default faveObservation;
