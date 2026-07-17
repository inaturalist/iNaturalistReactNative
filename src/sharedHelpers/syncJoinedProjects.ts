import { PROJECT_SUMMARY_POF_FIELDS } from "api/fields";
import type { ApiProjectSummaryWithPOF } from "api/types";
import fetchUserProjects from "api/usersTyped";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import type Realm from "realm";
import Project from "realmModels/Project";
import { log } from "sharedHelpers/logger";

import safeRealmWrite from "./safeRealmWrite";

const logger = log.extend( "syncJoinedProjects.ts" );

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
  try {
    const apiToken = await getJWT( );
    const remoteProjectIds: number[] = [];

    const params = {
      id: currentUserId,
      per_page: 100,
      fields: PROJECT_SUMMARY_POF_FIELDS,
      ttl: -1,
    };
    const response = await fetchUserProjects<ApiProjectSummaryWithPOF>(
      params,
      { api_token: apiToken },
    );

    // Unusable page: abort without pruning so we never delete local
    // projects based on an incomplete picture of the remote state
    if ( response === null || !response.results ) {
      return;
    }

    // Update local copy of the current user's joined projects
    Project.upsertRemoteProjects( response.results, realm );
    remoteProjectIds.push( ...response.results.map( p => p.id ) );

    // Remove projects that are present locally but no longer in server response
    deleteNotRemoteProjects( remoteProjectIds, realm );
  } catch ( error ) {
    // Both triggers (deferred startup and chooser mount) are fire-and-forget
    // background syncs, so failures must not surface to the user
    logger.error( "Failed to sync joined projects", error );
  }
}

export default syncJoinedProjects;
