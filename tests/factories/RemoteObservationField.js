import { define } from "factoria";

export default define( "RemoteObservationField", faker => ( {
  id: faker.number.int( ),
  name: faker.person.firstName( ),
  datatype: "text",
  allowed_values: "",
  description: faker.lorem.paragraph( ),
} ) );
