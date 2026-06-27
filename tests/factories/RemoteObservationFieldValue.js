import { define } from "factoria";

export default define( "RemoteObservationFieldValue", faker => ( {
  id: faker.number.int( ),
  field_id: faker.number.int( ),
  uuid: faker.string.uuid( ),
  value: faker.person.firstName( ),
} ) );
