import type Realm from "realm";

async function syncJoinedProjects(
  realm: Realm,
  currentUserId: number | undefined,
): Promise<void> {
  if ( !currentUserId ) {
    return;
  }

  console.log( "realm", realm );
}

export default syncJoinedProjects;
