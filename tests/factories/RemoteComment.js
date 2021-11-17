import { define } from "factoria";

export default define( "RemoteComment", faker => ( {
  id: faker.datatype.number( ),
  uuid: faker.datatype.uuid( ),
  created_at: "2021-11-09T08:28:05-08:00",
  updated_at: "2021-11-09T17:22:17-08:00",
  user: factory( "RemoteUser" ),
  body: faker.lorem.sentence( )
} ) );
