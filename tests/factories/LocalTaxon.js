import { define } from "factoria";

export default define( "LocalTaxon", faker => ( {
  id: faker.datatype.number( ),
  name: faker.name.firstName( ),
  rank: "family",
  preferredCommonName: faker.name.findName( )
} ) );
