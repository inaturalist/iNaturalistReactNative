import { define } from "factoria";

import userFactory from "./RemoteUser";

export default define( "RemoteVote", faker => ( {
  created_at: faker.date.past( ).toISOString( ),
  id: faker.number.int( ),
  // Default to vote in favor
  vote_flag: true,
  // Default to unscoped vote, e.g. obs fave
  vote_scope: null,
  user: userFactory( "RemoteUser" ),
  user_id: faker.number.int( ),
} ) );
