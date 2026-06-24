import { define } from "factoria";

import ofFactory from "./RemoteObservationField";

export default define( "RemoteObservationFieldValue", faker => ( {
  id: faker.number.int( ),
  field_id: faker.number.int( ),
  observation_field: ofFactory( "RemoteObservationField" ),
  uuid: faker.string.uuid( ),
  value: faker.person.firstName( ),
} ) );
