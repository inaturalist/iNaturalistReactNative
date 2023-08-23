import { define } from "factoria";

export default define( "RemoteTaxon", faker => ( {
  id: faker.datatype.number( ),
  name: faker.name.fullName(),
  preferred_common_name: faker.name.fullName()
} ) );
