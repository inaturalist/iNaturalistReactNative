import { define } from "factoria";

import ofFactory from "./RemoteObservationField";

export default define( "RemoteProjectObservationField", faker => ( {
  id: faker.number.int(),
  observation_field: ofFactory( "RemoteObservationField" ),
  position: faker.number.int(),
  required: true,
} ) );
