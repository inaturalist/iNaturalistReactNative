// @flow

import inatjs from "inaturalistjs";

import { getJWTToken } from "../../LoginSignUp/AuthenticationService";

const createComment = async ( body: string ): Promise<?number> => {
  const apiToken = await getJWTToken( false );
  try {
    const apiParams = {
      comment: {
        body
      }
    };
    const options = {
      api_token: apiToken
    };
    // TODO: make sure this isn't showing 422 error (like create identification)

    const response = await inatjs.comments.create( apiParams, options );
    return response.total_results;
  } catch ( e ) {
    console.log( "Couldn't create comment:", JSON.stringify( e.response ), );
  }
};

export default createComment;
