import factory, { define } from "factoria";

export default define( "RemoteObservationPhoto", faker => ( {
  uuid: faker.datatype.uuid( ),
  id: faker.datatype.number( ),
  photo: factory( "RemotePhoto" ),
  position: faker.datatype.number( )
} ) );
