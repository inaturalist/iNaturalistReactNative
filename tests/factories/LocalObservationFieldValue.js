import { define } from "factoria";

export default define( "LocalObservationFieldValue", faker => ( {
  id: faker.number.int( ),
  obsFieldId: faker.number.int( ),
  value: faker.person.firstName( ),
} ) );
