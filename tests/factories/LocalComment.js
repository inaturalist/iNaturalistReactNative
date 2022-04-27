import factory, { define } from "factoria";

export default define( "LocalComment", faker => ( {
  uuid: faker.datatype.uuid( ),
  id: faker.datatype.number( ),
  createdAt: "2019-09-09T08:28:05-08:00",
  user: factory( "RemoteUser" ),
  body: faker.lorem.sentence( )
} ) );
