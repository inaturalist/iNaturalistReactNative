import { define } from "factoria";

import ofFactory from "./LocalObservationField";

export default define( "LocalProjectObservationField", faker => ( {
  id: faker.number.int( ),
  obsField: ofFactory( "LocalObservationField" ),
  position: faker.number.int( ),
  required: true,
} ) );
