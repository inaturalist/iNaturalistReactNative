import { PROJECT_SUMMARY_POF_FIELDS } from "api/fields";
import type { ApiProjectSummaryWithPOF } from "api/types";
import fetchUserProjects from "api/usersTyped";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import type Realm from "realm";

async function syncJoinedProjects(
  realm: Realm,
  currentUserId: number | undefined,
): Promise<void> {
  if ( !currentUserId ) {
    return;
  }

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

  console.log( "response", response );
  console.log( "realm", realm );
}

export default syncJoinedProjects;
