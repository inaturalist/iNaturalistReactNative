import { define } from "factoria";

export default define( "RemoteTaxon", faker => ( {
  name: faker.name.firstName( ),
  rank: "genus",
  preferred_common_name: faker.name.findName( )
} ) );
