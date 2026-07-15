import { PROJECT_SUMMARY_POF_FIELDS } from "api/fields";
import type { ApiProjectSummaryWithPOF } from "api/types";
import fetchUserProjects from "api/usersTyped";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import type Realm from "realm";
import Project from "realmModels/Project";

import safeRealmWrite from "./safeRealmWrite";

const deleteNotRemoteProjects = ( remoteProjects: number[], realm: Realm ) => {
  if ( !remoteProjects ) { return; }
  safeRealmWrite( realm, ( ) => {
    const localProjectsToDelete = remoteProjects.length === 0
      ? realm.objects( "Project" )
      : realm.objects( "Project" )
        .filtered( `NOT (id IN { ${remoteProjects} })` );
    localProjectsToDelete.forEach( project => {
      realm.delete( project );
    } );
  }, "removing projects from realm that are not remote" );
};

async function syncJoinedProjects(
  realm: Realm,
  currentUserId: number,
): Promise<void> {
  const params = {
    id: currentUserId,
    per_page: 200,
    fields: PROJECT_SUMMARY_POF_FIELDS,
    ttl: -1,
  };

  const apiToken = await getJWT( );
  const response = await fetchUserProjects<ApiProjectSummaryWithPOF>(
    params,
    { api_token: apiToken },
  );

  if ( response === null || !response.results ) {
    return;
  }

  // Update local copy of the current user's joined projects
  Project.upsertRemoteProjects( response.results, realm );

  // Remove projects that are present locally but no longer in server response
  const remoteProjectsId = response.results.map( p => p.id );
  deleteNotRemoteProjects( remoteProjectsId, realm );
}

export default syncJoinedProjects;
