import { define } from "factoria";

export default define( "LocalObservationField", faker => ( {
  allowedValues: [faker.person.firstName( ), faker.person.firstName( )],
  datatype: "text",
  description: faker.lorem.paragraph( ),
  id: faker.number.int( ),
  name: faker.person.firstName( ),
} ) );
