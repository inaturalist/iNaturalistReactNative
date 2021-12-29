import factory, { define } from "factoria";

export default define( "LocalTaxon", faker => ( {
  id: faker.datatype.number( ),
  name: faker.name.firstName( ),
  rank: "family",
  preferred_common_name: faker.name.findName( ),
  default_photo: factory( "LocalPhoto" )
} ) );
