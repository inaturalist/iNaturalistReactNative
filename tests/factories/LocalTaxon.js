import { define } from "factoria";

export default define( "LocalTaxon", faker => ( {
  id: faker.datatype.number( ),
  name: faker.name.fullName(),
  preferred_common_name: faker.name.fullName(),
  isIconic: false
} ) );
