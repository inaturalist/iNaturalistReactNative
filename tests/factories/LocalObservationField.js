import { define } from "factoria";

export default define( "LocalObservationField", faker => ( {
  allowed_values: [faker.person.firstName( ), faker.person.firstName( )],
  datatype: "text",
  description: faker.lorem.paragraph( ),
  id: faker.number.int( ),
  name: faker.person.firstName( ),
} ) );
