import { define } from "factoria";

import userFactory from "./RemoteUser";

export default define( "RemoteComment", faker => ( {
  body: faker.lorem.paragraph( ),
  created_at: faker.date.past( ).toISOString( ),
  id: faker.number.int( ),
  parent_id: faker.number.int( ),
  parent_type: "Observation",
  updated_at: faker.date.past( ).toISOString( ),
  user: userFactory( "RemoteUser" ),
  user_id: faker.number.int( ),
  uuid: faker.string.uuid( ),
} ) );
