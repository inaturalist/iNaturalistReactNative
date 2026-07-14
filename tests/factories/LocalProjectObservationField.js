import { define } from "factoria";

import ofFactory from "./LocalObservationField";

export default define( "LocalProjectObservationField", faker => ( {
  id: faker.number.int( ),
  observation_field: ofFactory( "LocalObservationField" ),
  position: faker.number.int( ),
  required: faker.datatype.boolean( 0.5 ),
} ) );
