// @flow

import inatjs from "inaturalistjs";

import { getJWTToken } from "../../LoginSignUp/AuthenticationService";

const addToProject = async ( projectId: number, obsId: string ): Promise<?number> => {
  const apiToken = await getJWTToken( false );
  try {
    const apiParams = {
      project_observation: {
        project_id: projectId,
        observation_id: obsId
      }
    };
    const options = {
      api_token: apiToken
    };
    // TODO: make sure this isn't showing 422 error (like create identification)
    console.log( apiParams, options, "params project add" );

    const response = await inatjs.project_observations.create( apiParams, options );
    console.log( response, "response in project add" );
    return response.total_results;
  } catch ( e ) {
    console.log( "Couldn't add to project:", JSON.stringify( e.response ) );
  }
  return 0;
};

export default addToProject;
