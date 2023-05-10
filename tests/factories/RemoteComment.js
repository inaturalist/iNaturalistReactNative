import factory, { define } from "factoria";

export default define( "RemoteComment", faker => ( {
  id: faker.datatype.number( ),
  uuid: faker.datatype.uuid( ),
  created_at: "2015-02-13T05:15:38+00:00",
  updated_at: "2015-02-12T20:41:10-08:00",
  user: factory( "RemoteUser" ),
  body: faker.lorem.sentence( )
} ) );
