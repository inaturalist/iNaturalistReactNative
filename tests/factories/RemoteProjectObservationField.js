import { define } from "factoria";

// TODO: use this instead once MOB-1497 has landed
// import ofFactory from "./RemoteObservationField";

export default define( "RemoteProjectObservationField", faker => ( {
  id: faker.number.int(),
  // observation_field: ofFactory( "RemoteObservationField" ),
  observation_field: {
    id: 1,
  },
  position: faker.number.int(),
  required: faker.datatype.boolean( 0.5 ),
} ) );
