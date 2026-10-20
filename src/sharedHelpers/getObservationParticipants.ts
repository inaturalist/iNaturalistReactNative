import type { ApiUser } from "api/types";

// Structural types so this works with both API observations and live Realm
// observations
interface ParticipantUser {
  icon_url?: string | null;
  id?: number | null;
  login?: string | null;
  name?: string | null;
}

interface ActivityItem {
  created_at?: string | null;
  hidden?: boolean | null;
  user?: ParticipantUser | null;
}

interface ObservationWithActivity {
  comments?: Iterable<ActivityItem> | null;
  identifications?: Iterable<ActivityItem> | null;
  user?: ParticipantUser | null;
}

const toPlainUser = ( user: ParticipantUser ): ApiUser => ( {
  icon_url: user.icon_url ?? undefined,
  id: user.id ?? undefined,
  login: user.login ?? undefined,
  name: user.name ?? undefined,
} );

const timestamp = ( item: ActivityItem ) => (
  item.created_at
    ? Date.parse( item.created_at ) || 0
    : 0
);

// Returns the people on an observation, for suggesting @mentions: the
// observer first, then everyone who left a comment or an identification,
// most recent activity first. Leaves out the current user and hidden
// comments and identifications. Withdrawn identifications still count
function getObservationParticipants(
  observation: ObservationWithActivity | null | undefined,
  currentUserId: number | null | undefined,
  limit: number,
): ApiUser[] {
  if ( !observation ) return [];
  const participants: ApiUser[] = [];
  const seenIds = new Set<number>( );
  const add = ( user: ParticipantUser | null | undefined ) => {
    if ( !user?.id || !user.login ) return;
    if ( user.id === currentUserId || seenIds.has( user.id ) ) return;
    seenIds.add( user.id );
    participants.push( toPlainUser( user ) );
  };

  add( observation.user );
  const activity = [
    ...Array.from( observation.comments ?? [] ),
    ...Array.from( observation.identifications ?? [] ),
  ]
    .filter( item => !item.hidden )
    .sort( ( a, b ) => timestamp( b ) - timestamp( a ) );
  activity.forEach( item => add( item.user ) );

  return participants.slice( 0, limit );
}

export type { ObservationWithActivity };
export default getObservationParticipants;
