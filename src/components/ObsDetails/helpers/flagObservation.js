// @flow

import inatjs from "inaturalistjs";

import { getJWTToken } from "../../LoginSignUp/AuthenticationService";

const flagObservation = async ( id: number ): Promise<?number> => {
  const apiToken = await getJWTToken( false );
  try {
    const params = {
      flag: {
        // flag options:
        // copyright infringement
        // inappropriate
        // other (include text explaination with this option)
        flag: "spam",
        flaggable_id: id,
        flaggable_type: "Photo"
      },
      flag_explaination: null
    };
    const options = {
      api_token: apiToken
    };
    console.log( options, "options in flag obs" );

    const response = await inatjs.flags.create( params, options );
    return response.total_results;
  } catch ( e ) {
    console.log( "Couldn't flag observation:", JSON.stringify( e.response ) );
  }
  return 0;
};

export default flagObservation;
