// @flow

import { getJWTToken } from "components/LoginSignUp/AuthenticationService";
import inatjs from "inaturalistjs";

const createComment = async ( body: string, uuid: string ): Promise<?number> => {
  const apiToken = await getJWTToken( false );
  try {
    const apiParams = {
      comment: {
        body,
        parent_id: uuid,
        parent_type: "Observation"
      }
    };
    const options = {
      api_token: apiToken
    };
    // TODO: make sure this isn't showing 422 error (like create identification)

    const response = await inatjs.comments.create( apiParams, options );
    return response.total_results;
  } catch ( e ) {
    console.log( "Couldn't create comment:", JSON.stringify( e.response ) );
  }
  return 0;
};

export default createComment;
