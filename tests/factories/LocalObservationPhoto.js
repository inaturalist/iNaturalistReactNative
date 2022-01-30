import factory, { define } from "factoria";

export default define( "LocalObservationPhoto", faker => ( {
  uuid: faker.datatype.uuid( ),
  id: faker.datatype.number( ),
  photo: factory( "LocalPhoto" ),
  position: faker.datatype.number( )
} ) );
